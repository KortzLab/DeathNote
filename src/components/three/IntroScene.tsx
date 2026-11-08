"use client";

import {
  forwardRef,
  useEffect,
  useEffectEvent,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { Ash, DustBurst } from "@/components/three/Particles";
import { BookModel } from "@/components/three/BookModel";
import { COVER_T, LEAVES, PAGE_W, useBookAssets } from "@/components/three/book";
import { useCanvasGestures, useLightning } from "@/components/three/hooks";
import type { SoundName } from "@/lib/sound/synth";

export type Stage = "loading" | "falling" | "landed" | "opening" | "open";

export type IntroHandle = { open: () => void; next: () => void; prev: () => void };

type Props = {
  onStage: (s: Stage) => void;
  onLeaf: (turned: number, total: number) => void;
  play: (name: SoundName, opts?: { volume?: number; rate?: number }) => void;
  lowPower?: boolean;
};

const CAMERA_START = new THREE.Vector3(0, 3.2, 3.9);
const CAMERA_OPEN = new THREE.Vector3(0, 3.0, 3.0);

/**
 * The scene is framed for landscape. On portrait screens the camera moves in so the closed
 * book fills most of the width, then pulls back just enough for the open spread. The view
 * width scales with distance * aspect, so the factors scale with 1 / aspect; the constants
 * were tuned against renders at 9:16.
 */
function framing(aspect: number) {
  if (aspect >= 1) return { closed: 1, open: 1 };
  return { closed: Math.min(1, 0.42 / aspect), open: Math.min(2.2, 0.92 / aspect) };
}
const { lerp } = THREE.MathUtils;

export const IntroScene = forwardRef<IntroHandle, Props>(function IntroScene(props, ref) {
  const [dpr, setDpr] = useState(props.lowPower ? 1 : 1.5);

  return (
    <Canvas
      dpr={dpr}
      camera={{ position: CAMERA_START.toArray(), fov: 36, near: 0.1, far: 40 }}
      gl={{ antialias: !props.lowPower, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
      aria-hidden
    >
      <PerformanceMonitor
        onDecline={() => setDpr(1)}
        onIncline={() => setDpr(props.lowPower ? 1 : 1.5)}
      />
      <fog attach="fog" args={["#040506", 6, 13]} />
      <World {...props} ref={ref} />
    </Canvas>
  );
});

const World = forwardRef<IntroHandle, Props>(function World(
  { onStage, onLeaf, play, lowPower = false },
  ref,
) {
  const { camera, pointer, size } = useThree();
  const fit = framing(size.width / size.height);
  const assets = useBookAssets(lowPower);

  const rig = useRef<THREE.Group>(null);
  const book = useRef<THREE.Group>(null);
  const coverPivot = useRef<THREE.Group>(null);
  const coverMaterial = useRef<THREE.MeshPhysicalMaterial>(null);
  const cursorLight = useRef<THREE.PointLight>(null);
  const ambient = useRef<THREE.AmbientLight>(null);

  // Animation state lives in refs: it changes every frame and must not re-render.
  const stage = useRef<Stage>("loading");
  const shake = useRef(0);
  const turned = useRef(0);
  const flipping = useRef(false);
  const cameraBase = useRef(CAMERA_START.clone().multiplyScalar(fit.closed));
  const dust = useMemo(() => ({ value: 0 }), []);

  const setStage = (s: Stage) => {
    stage.current = s;
    onStage(s);
  };

  const startFall = useEffectEvent((b: THREE.Group) => {
    setStage("falling");
    b.position.set(-PAGE_W / 2, 7, -0.6);
    b.rotation.set(-Math.PI / 2 + 0.9, 0.6, 0.5);
    return gsap
      .timeline()
      .to(b.position, { y: 0, z: 0, duration: 3.1, ease: "sine.in" }, 0)
      .to(b.rotation, { x: -Math.PI / 2, y: 0, z: 0, duration: 3.1, ease: "power1.out" }, 0)
      .add(() => {
        shake.current = 1;
        play("thud", { volume: 0.9 });
        gsap.fromTo(dust, { value: 0 }, { value: 1, duration: 1.8, ease: "power1.out" });
      })
      .to(b.position, { y: 0.06, duration: 0.14, ease: "power2.out" })
      .to(b.position, { y: 0, duration: 0.22, ease: "bounce.out" })
      .add(() => setStage("landed"));
  });

  useEffect(() => {
    if (!assets || !book.current) return;
    const tl = startFall(book.current);
    return () => {
      tl.kill();
    };
  }, [assets]);

  function open() {
    const pivot = coverPivot.current;
    if (stage.current !== "landed" || !pivot || !book.current) return;
    setStage("opening");
    play("creak", { volume: 0.7 });
    gsap
      .timeline({ onComplete: () => setStage("open") })
      // a little resistance, the swing, then a slight overshoot that settles
      .to(pivot.rotation, { y: -0.12, duration: 0.5, ease: "power2.in" })
      .to(pivot.rotation, { y: -Math.PI * 1.01, duration: 1.5, ease: "power3.inOut" })
      .to(pivot.rotation, { y: -Math.PI, duration: 0.35, ease: "power1.out" })
      .to(pivot.position, { z: COVER_T, duration: 1.2, ease: "power2.inOut" }, 0.6)
      .to(book.current.position, { x: 0, duration: 1.8, ease: "power2.inOut" }, 0.3)
      .to(
        cameraBase.current,
        {
          y: CAMERA_OPEN.y * fit.open,
          z: CAMERA_OPEN.z * fit.open,
          duration: 2.2,
          ease: "power2.inOut",
        },
        0.2,
      )
      .add(() => {
        shake.current = 0.25;
        play("thud", { volume: 0.4, rate: 1.3 });
      }, 2.2);
  }

  function flip(dir: 1 | -1) {
    if (stage.current !== "open" || !assets || flipping.current) return;
    const leaf = assets.leaves[dir === 1 ? turned.current : turned.current - 1];
    if (!leaf) return;

    flipping.current = true;
    const { uPhi, uK } = leaf.uniforms;
    play("rustle", { volume: 0.55, rate: 0.85 + Math.random() * 0.3 });
    gsap.to(uPhi, {
      value: dir === 1 ? Math.PI : 0,
      duration: 1.1,
      ease: "power2.inOut",
      // curl peaks mid-turn and relaxes as the page lands
      onUpdate: () => void (uK.value = Math.sin(uPhi.value) * 1.35 * dir),
      onComplete: () => {
        uK.value = 0;
        turned.current += dir;
        flipping.current = false;
        onLeaf(turned.current, LEAVES.length);
      },
    });
  }

  useImperativeHandle(ref, () => ({ open, next: () => flip(1), prev: () => flip(-1) }));

  useCanvasGestures((g) => {
    if (stage.current === "landed") return open();
    if (g.kind === "swipe") flip(g.dx < 0 ? 1 : -1);
    else flip(g.x > window.innerWidth / 2 ? 1 : -1);
  });

  useLightning(ambient, () => play("thunder", { volume: 0.6 }));

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;

    if (rig.current) {
      const tilt = stage.current === "landed" ? 1 : stage.current === "open" ? 0.25 : 0.1;
      rig.current.rotation.x = lerp(rig.current.rotation.x, -pointer.y * 0.18 * tilt, 0.06);
      rig.current.rotation.y = lerp(rig.current.rotation.y, pointer.x * 0.22 * tilt, 0.06);
      rig.current.position.y = stage.current === "landed" ? Math.sin(t * 1.2) * 0.02 : 0;
    }

    if (cursorLight.current) {
      const p = cursorLight.current.position;
      p.x = lerp(p.x, pointer.x * 2.2, 0.08);
      p.z = lerp(p.z, -pointer.y * 1.6 + 0.6, 0.08);
    }

    if (coverMaterial.current) {
      const flicker = Math.random() > 0.992 ? 0.5 : 0;
      coverMaterial.current.emissiveIntensity = Math.max(
        0.12,
        0.3 + Math.sin(t * 1.3) * 0.06 + flicker,
      );
    }

    shake.current = Math.max(0, shake.current - dt * 1.6);
    const k = shake.current ** 2 * 0.12;
    const base = cameraBase.current;
    camera.position.set(
      base.x + (Math.random() - 0.5) * k,
      base.y + (Math.random() - 0.5) * k,
      base.z + (Math.random() - 0.5) * k,
    );
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <ambientLight ref={ambient} intensity={0.25} />
      <spotLight
        position={[2.5, 6, 3]}
        angle={0.45}
        penumbra={0.9}
        intensity={28}
        color="#e4edf3"
      />
      <pointLight
        ref={cursorLight}
        position={[0, 1.4, 0.6]}
        intensity={2.2}
        distance={6}
        color="#cfe2ee"
      />
      <Ash count={lowPower ? 500 : 1400} />
      <DustBurst progress={dust} count={lowPower ? 120 : 260} />

      <group ref={rig}>
        <group
          ref={book}
          position={[-PAGE_W / 2, 7, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          visible={Boolean(assets)}
        >
          {assets && (
            <BookModel
              assets={assets}
              coverPivotRef={coverPivot}
              coverMaterialRef={coverMaterial}
            />
          )}
        </group>
      </group>

      <ContactShadows
        position={[0, -0.002, 0]}
        opacity={0.75}
        scale={7}
        blur={2.6}
        far={3}
        resolution={lowPower ? 256 : 512}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#050607" roughness={1} />
      </mesh>
    </>
  );
});

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * Subtle floating particle network for the hero background.
 * Dots drift slowly, nearby dots connect with faint lines.
 * Mouse position gently steers the camera for depth.
 */
export default function HeroParticles() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const width = mount.clientWidth
    const height = mount.clientHeight

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
    camera.position.z = 60

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mount.appendChild(renderer.domElement)

    /* ── particles ─────────────────────────────────────── */
    const COUNT = 90
    const positions = new Float32Array(COUNT * 3)
    const velocities: THREE.Vector3[] = []

    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100
      positions[i * 3 + 1] = (Math.random() - 0.5) * 60
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40
      velocities.push(new THREE.Vector3(
        (Math.random() - 0.5) * 0.015,
        (Math.random() - 0.5) * 0.015,
        (Math.random() - 0.5) * 0.01
      ))
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const material = new THREE.PointsMaterial({
      color: 0x0f0f0f,
      size: 1.8,
      transparent: true,
      opacity: 0.35,
      sizeAttenuation: true,
    })
    const points = new THREE.Points(geometry, material)
    scene.add(points)

    /* ── connecting lines ──────────────────────────────── */
    const lineGeometry = new THREE.BufferGeometry()
    const maxLines = COUNT * 6
    const linePositions = new Float32Array(maxLines * 6)
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3))
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.08,
    })
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial)
    scene.add(lines)

    /* ── mouse parallax ────────────────────────────────── */
    const mouse = { x: 0, y: 0 }
    const onMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouseMove)

    /* ── resize ────────────────────────────────────────── */
    const onResize = () => {
      const w = mount.clientWidth
      const h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    let frameId: number
    const LINK_DIST = 18

    const animate = () => {
      frameId = requestAnimationFrame(animate)

      const pos = geometry.attributes.position.array as Float32Array
      for (let i = 0; i < COUNT; i++) {
        pos[i * 3] += velocities[i].x
        pos[i * 3 + 1] += velocities[i].y
        pos[i * 3 + 2] += velocities[i].z

        if (Math.abs(pos[i * 3]) > 50) velocities[i].x *= -1
        if (Math.abs(pos[i * 3 + 1]) > 30) velocities[i].y *= -1
        if (Math.abs(pos[i * 3 + 2]) > 20) velocities[i].z *= -1
      }
      geometry.attributes.position.needsUpdate = true

      // rebuild connecting lines each frame (cheap at this count)
      let lineIdx = 0
      const linePos = lineGeometry.attributes.position.array as Float32Array
      for (let i = 0; i < COUNT && lineIdx < maxLines - 1; i++) {
        for (let j = i + 1; j < COUNT && lineIdx < maxLines - 1; j++) {
          const dx = pos[i * 3] - pos[j * 3]
          const dy = pos[i * 3 + 1] - pos[j * 3 + 1]
          const dz = pos[i * 3 + 2] - pos[j * 3 + 2]
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
          if (dist < LINK_DIST) {
            linePos[lineIdx * 6] = pos[i * 3]
            linePos[lineIdx * 6 + 1] = pos[i * 3 + 1]
            linePos[lineIdx * 6 + 2] = pos[i * 3 + 2]
            linePos[lineIdx * 6 + 3] = pos[j * 3]
            linePos[lineIdx * 6 + 4] = pos[j * 3 + 1]
            linePos[lineIdx * 6 + 5] = pos[j * 3 + 2]
            lineIdx++
          }
        }
      }
      lineGeometry.setDrawRange(0, lineIdx * 2)
      lineGeometry.attributes.position.needsUpdate = true

      // gentle camera drift toward mouse
      camera.position.x += (mouse.x * 8 - camera.position.x) * 0.02
      camera.position.y += (-mouse.y * 5 - camera.position.y) * 0.02
      camera.lookAt(0, 0, 0)

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMouseMove)
      geometry.dispose()
      material.dispose()
      lineGeometry.dispose()
      lineMaterial.dispose()
      renderer.dispose()
      mount.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div
      ref={mountRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}

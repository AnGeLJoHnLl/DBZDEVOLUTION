# ⚡ Ki Clash: Super Devolution Arena

Juego de lucha retro 2D inspirado en las mecánicas clásicas de *Dragon Ball Devolution* y *Dragon Ball Z Goku Gekitōden*, creado desde cero en **HTML5 Canvas y JavaScript puro**.

---

## 🌟 Características Principales

* **Sistema de Combate Ágil**:
  * Movimiento omnidireccional en 8 direcciones.
  * Cadena de combos cuerpo a cuerpo (Jab → Cross → Patada → Golpe Final con *Knockback*).
  * *Dash* / Teletransporte instantáneo con imágenes residuales.
  * Guardia / Bloqueo activo (reduce 75% del daño y neutraliza empujes).
* **Mecánica de Ki / Energía**:
  * Carga de Ki manteniendo presionado el botón (con aura pulsante y vibración sonora).
  * Ráfagas de Ki rápidas (proyectiles de bajo coste).
  * **Super Rayos de Energía** (*Kamehameha, Galick Gun, Death Beam, Special Beam Cannon*).
  * **Choque de Poderes (*Beam Clash*)**: Si dos rayos colisionan de frente, se inicia un choque donde ambos jugadores deben presionar botones a toda velocidad para empujar el haz de energía hacia el rival.
* **Personajes**:
  * **Goku** (*Earth Hero*): Habilidades balanceadas, *Kamehameha*.
  * **Vegeta** (*Saiyan Prince*): Rápido y agresivo, *Galick Gun*.
  * **Piccolo** (*Namekian Master*): Mayor alcance cuerpo a cuerpo, *Special Beam Cannon*.
  * **Frieza** (*Galactic Emperor*): Ráfagas rápidas letales, *Death Beam*.
* **Escenarios Clásicos**:
  * *World Martial Arts Tournament* (Torneo de Artes Marciales).
  * *Rocky Wasteland* (Páramo Rocoso).
  * *Planet Namek* (Planeta Namek con doble sol).
  * *Hyperbolic Time Chamber* (Habitación del Tiempo).
* **Audio y Visuales Procedurales**:
  * Efectos de sonido sintetizados en tiempo real mediante la **Web Audio API** (sin archivos de audio externos).
  * Gráficos estilo *Super Deformed (SD)* pixel art dibujados por código.
  * Filtro CRT Scanlines intercambiable.
  * Soporte para teclado, pantallas táctiles (móviles/tablets) y mandos USB / Bluetooth (Gamepad API).

---

## 🎮 Controles

### Jugador 1 (O Gamepad 1)
| Acción | Teclado | Gamepad (Xbox / PS) |
|---|---|---|
| **Moverse (8 direcciones)** | `W`, `A`, `S`, `D` | D-Pad / Stick Izquierdo |
| **Ataque / Combo** | `J` | Botón X (Cuadrado) |
| **Ráfaga Ki** | `K` | Botón A (Cruz) |
| **Super Rayo de Energía** | `L` | Botón B (Círculo) |
| **Cargar Ki** | `ESPACIO` | L1 / L2 (LB / LT) |
| **Teletransporte / Dash** | `SHIFT` / `I` | R1 / R2 (RB / RT) |
| **Guardia / Bloqueo** | `U` | Botón Y (Triángulo) |

### Jugador 2 (Modo 2P Local o Gamepad 2)
| Acción | Teclado | Gamepad 2 |
|---|---|---|
| **Moverse (8 direcciones)** | `Flechas` | D-Pad / Stick Izquierdo |
| **Ataque / Combo** | `NumPad 1` | Botón X (Cuadrado) |
| **Ráfaga Ki** | `NumPad 2` | Botón A (Cruz) |
| **Super Rayo de Energía** | `NumPad 3` | Botón B (Círculo) |
| **Cargar Ki** | `NumPad 0` / `Enter` | L1 / L2 (LB / LT) |
| **Teletransporte / Dash** | `NumPad .` | R1 / R2 (RB / RT) |
| **Guardia / Bloqueo** | `NumPad 4` | Botón Y (Triángulo) |

---

## 🚀 Cómo Alojarlo en un Repositorio Nuevo (GitHub Pages)

Este proyecto no requiere Webpack, Node.js ni compilación. Son archivos estáticos puros (`index.html`, `style.css`, `.js`) listos para publicarse.

### Pasos rápidos:
1. Crea un nuevo repositorio en tu cuenta de GitHub (por ejemplo: `ki-clash-arena`).
2. En la carpeta del proyecto, ejecuta:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Ki Clash retro arena fighter"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/ki-clash-arena.git
   git push -u origin main
   ```
3. En tu repositorio de GitHub, ve a **Settings** → **Pages** → Selecciona la rama `main` y guarda.
4. En 1 minuto tendrás tu enlace público listo para jugar en cualquier navegador o celular.

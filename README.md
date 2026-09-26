# ⚡ Ki Clash: Super Devolution Arena

Juego de lucha retro 2D inspirado en las mecánicas clásicas de *Dragon Ball Devolution* y *Dragon Ball Z Goku Gekitōden*, creado desde cero en **HTML5 Canvas y JavaScript puro**.

---

## 🌟 Novedades y Características

* **Pantalla Completa y Adaptable (Full Window)**:
  * El juego ocupa el 100% de la pantalla del navegador sin marcos molestos, con escalado pixelado nítido (*crisp pixel-art*).
* **Menú Completo de Ajustes (`ESC` o botón ⚙️)**:
  * **Configuración y Reasignación de Teclas (Key Remap)**: Puedes cambiar cualquier tecla del Jugador 1 o Jugador 2 haciendo clic en la acción y presionando tu nueva tecla. ¡Se guarda automáticamente en tu navegador (`localStorage`)!
  * **Control de Audio**: Control deslizante de volumen de 0% a 100%, opción para silenciar y filtro CRT scanlines conmutable.
  * **Leyenda y Guía de Combate Integrada**: Lista detallada de combos, uso de Ki, choque de rayos (*Beam Clash*) y consejos de defensa.
* **Sistema de Combate**:
  * Movimiento en 8 direcciones.
  * Combos encadenados: Jab → Cross → Patada → Golpe Final con *Knockback*.
  * *Dash* / Teletransporte con imágenes residuales (*Vanish*).
  * Guardia / Bloqueo activo (-75% de daño).
  * Carga de Ki con aura luminosa y zumbido dinámico.
  * Ráfagas rápidas y **Super Rayos continuos** (*Kamehameha, Galick Gun, Death Beam, Special Beam Cannon*).
  * **Choque de Poderes**: Si dos rayos colisionan de frente, compites pulsando botones para ganar la explosión.
* **4 Personajes Clásicos**: Goku, Vegeta, Piccolo y Freezer.
* **4 Escenarios**: Torneo de Artes Marciales, Páramo Rocoso, Planeta Namek y Habitación del Tiempo.
* **Compatibilidad Total**: Teclado, Mandos USB/Bluetooth (Xbox, PlayStation) y controles táctiles para celulares y tablets.

---

## 🎮 Controles por Defecto

> Puedes cambiarlos en cualquier momento desde el menú de **⚙️ AJUSTES** o pulsando `ESC`.

### Jugador 1 (O Gamepad 1)
| Acción | Tecla por Defecto | Gamepad (Xbox / PS) |
|---|---|---|
| **Moverse (8 direcciones)** | `W`, `A`, `S`, `D` | D-Pad / Stick Izquierdo |
| **Combo Físico** | `J` | Botón X (Cuadrado) |
| **Ráfaga Ki** | `K` | Botón A (Cruz) |
| **Super Rayo de Energía** | `L` | Botón B (Círculo) |
| **Cargar Ki (Aura)** | `ESPACIO` | L1 / L2 (LB / LT) |
| **Teletransporte / Dash** | `L-SHIFT` | R1 / R2 (RB / RT) |
| **Guardia / Bloqueo** | `U` | Botón Y (Triángulo) |

### Jugador 2 (Modo 2P Local o Gamepad 2)
| Acción | Tecla por Defecto | Gamepad 2 |
|---|---|---|
| **Moverse (8 direcciones)** | `Flechas` | D-Pad / Stick Izquierdo |
| **Combo Físico** | `NUM 1` | Botón X (Cuadrado) |
| **Ráfaga Ki** | `NUM 2` | Botón A (Cruz) |
| **Super Rayo de Energía** | `NUM 3` | Botón B (Círculo) |
| **Cargar Ki** | `NUM 0` / `Enter` | L1 / L2 (LB / LT) |
| **Teletransporte / Dash** | `NUM .` | R1 / R2 (RB / RT) |
| **Guardia / Bloqueo** | `NUM 4` | Botón Y (Triángulo) |

---

## 🚀 Cómo Alojarlo en GitHub Pages

1. Abre tu terminal en la carpeta [`C:/Users/alexa/.gemini/antigravity/scratch/ki-clash`](file:///C:/Users/alexa/.gemini/antigravity/scratch/ki-clash).
2. Ejecuta:
   ```bash
   git init
   git add .
   git commit -m "Add full-screen layout, customizable keybindings, and audio settings"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/ki-clash-arena.git
   git push -u origin main
   ```
3. En GitHub, ve a **Settings** → **Pages** → en *Branch* selecciona `main` y guarda.
4. Tu juego estará disponible online en minutos.

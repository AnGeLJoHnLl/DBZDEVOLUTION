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
  * **⚡ Sistema de Transformaciones en Combate (Estilo DB Devolution)**:
    * Carga tu Ki al 100% y mantén presionado **Cargar Ki** (~0.7s) o presiona **Golpe + Cargar** para despertar tu siguiente forma.
    * Estallido de ondas expansivas concéntricas, sacudida de pantalla, efecto de sonido ensordecedor y empuje al rival.
    * **Mejoras**: Recuperación de **+20 HP**, aumento de **velocidad (+12%)**, **+25% daño**, rayos más gruesos y nuevo sprite con cabello, auras y ataques especiales únicos.
    * **Ramas de Transformación**:
      * Goku: Base → Super Saiyan (SSJ) → Ultra Instinto (UI)
      * Vegeta: Base → Super Saiyan (SSJ) → Majin Vegeta → Ultra Ego (UE)
      * Gohan: SSJ2 → Gohan Definitivo → Gohan Beast
      * Trunks: Base → Super Saiyan (SSJ)
      * Piccolo: Maestro Namekiano → Orange Piccolo
      * Freezer: Forma Final → Golden Freezer
      * Vegetto / Gogeta: Formas Base/Super → Vegetto Blue (SSB) / Gogeta Blue (SSB)
      * Broly: Forma Z → Broly DBS (Full Power)
      * Majin Buu: Buu Gordo → Kid Buu
      * Goku Black: Base/Rosé → Zamasu Fusionado
      * Y fusiones legendarias GT (SSJ4 Goku / SSJ4 Vegeta → SSJ4 Gogeta).
* **Roster Legendario de 64 Luchadores (Cuadrícula Arcade 4x16)**:
  * **Fila 1 (Clásicos & Guerreros Z)**: Goku, Vegeta, Gohan (SSJ2), Gohan del Futuro, Trunks del Futuro, Piccolo, Krilin, Yamcha, Tenshinhan, Chaoz, Maestro Roshi, Goku Niño, Tao Pai Pai, Piccolo Daimaō, Tapion, Pikkon.
  * **Fila 2 (Saiyans, Fuerza Frieza, Androides & Jefes GT)**: Raditz, Nappa, Bardock, Capitán Ginyu, Recoome, Zarbon, Freezer, Cooler, Androide 16, Androide 17, Androide 18, Cell Perfecto, Super 17, Baby Vegeta, Omega Shenron, Broly (DBS).
  * **Fila 3 (Saga Buu, Fusiones Divinas, Villanos de Películas & Multiverso)**: Dabura, Majin Buu, Kid Buu, Majin Vegeta, Gohan Definitivo, Gotenks (SSJ3), Vegetto, Vegetto Blue (SSB), Gogeta, Gogeta Blue (SSB), Kefla (SSJ2), Broly (Z LSSJ), Janemba, Turles, Bojack, Zamasu Fusionado.
  * **Fila 4 (Super, Dioses de la Destrucción, Manga & GT)**: Beerus, Whis, Golden Freezer, Goku Black (Rosé), Hit, Jiren, Toppo (H.O.D.), Moro, Granolah, Goku Ultra Instinto, Vegeta Ultra Ego, Gohan Beast, Orange Piccolo, Goku SSJ4, Vegeta SSJ4, Gogeta SSJ4.
* **4 Escenarios Épicos**: Torneo de Artes Marciales, Páramo Rocoso, Planeta Namek y Habitación del Tiempo.
* **Compatibilidad Total**: Teclado reasignable, Ratón y Pantallas Táctiles (selección directa por click), y Mandos USB/Bluetooth (Xbox, PlayStation).

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

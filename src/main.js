/**
 * ARCHIVO PRINCIPAL (main.js)
 * ---------------------------
 * Este es el punto de entrada del videojuego. Aquí es donde configuramos
 * las reglas básicas antes de que empiece la diversión.
 * 
 * Phaser maneja el juego a través de "Escenas" (Scenes). Imagina que son
 * como las escenas de una película o los niveles de un juego:
 * - Boot: Carga inicial.
 * - Title: Pantalla de inicio.
 * - Game: El juego en sí.
 * - UI: La interfaz (vida, nivel).
 * - GameOver: Pantalla de fin.
 */
import './style.css';
import Phaser from 'phaser';

import BootScene from './scenes/Boot';
import TitleScene from './scenes/Title';
import GameScene from './scenes/Game';
import GameOverScene from './scenes/GameOver';
import UIScene from './scenes/UI';
import LevelUpScene from './scenes/LevelUp';
import PauseScene from './scenes/Pause';

// Configuración del juego / Game Configuration
const config = {
  type: Phaser.AUTO, // Elige WebGL o Canvas automáticamente / Chooses WebGL or Canvas automatically
  parent: 'app', // El ID del contenedor HTML / HTML container ID
  scale: {
    mode: Phaser.Scale.FIT, // Ajusta el juego para que quepa en la pantalla / Fits game to screen
    autoCenter: Phaser.Scale.CENTER_BOTH, // Centra el juego horizontal y verticalmente / Centers game
    width: 1080, // Resolución base (vertical) / Base resolution
    height: 1920
  },
  physics: {
    default: 'arcade', // Usamos físicas arcade simples / Simple arcade physics
    arcade: {
      debug: false // Ponlo en true para ver cajas de colisión / Set true to see hitboxes
    }
  },
  scene: [BootScene, TitleScene, GameScene, UIScene, LevelUpScene, GameOverScene, PauseScene]
};

// Inicializar el juego / Initialize game
new Phaser.Game(config);

// Variables globales
let mic;
let playerY = 800;
let velocity = 0;
let gravity = 0.8;
let obstacles = [];
let score = 0;
let gameOver = false;

let gameState = "menu"; // "menu", "playing", "gameover", "sleep"
let lastActivityTime = 0;
let sleepTimeout = 20000; // 20 segundos de inactividad

let logoImg, fondoImg;
let sleepVideo;
let wakeButton;

let playerName = "";
let input, startButton;
let restartButton, menuButton;

let ranking = [];
let bgMusic;
let bgMusicVolume = 0.2;

let voicePhrases = [];
let currentVoice;

let obstacleSpeed = 8;
let speedIncreaseRate = 0.05;
let minGap = 300;
let maxGap = 600;
let lastObstacleX = 0;
let tunnelProbability = 0.5;

let timeElapsed = 0;

let jumpProgress = 0; // Acumulador de progreso del salto
let maxJumpPower = -30; // Fuerza máxima del salto (más negativo = más alto)
let jumpChargeSpeed = 0.5; // Velocidad de carga del salto
let fontTitle, fontSubtitle, fontNormal, fontScore;

// Función para crear la interfaz del menú
function createMenuUI() {
  input = createInput();
  input.position(width / 2 - 150, height / 2 - 20);
  input.size(300);
  input.attribute('placeholder', 'Ingresa tu nombre');

  startButton = createButton("Jugar");
  startButton.position(width / 2 - 50, height / 2 + 30);
  startButton.mousePressed(() => {
    playerName = input.value() || "Jugador";
    input.hide();
    startButton.hide();
    stopVoice();
    resetGame();
    gameState = "playing";
    lastActivityTime = millis(); // Reiniciar tiempo de actividad
  });
}

function preload() {
  logoImg = loadImage("ESC-cine.png");
  myFont = loadFont('JumperPERSONALUSEONLY-BlackItalic.ttf');
  myFont2 = loadFont('BebasNeue-Regular.ttf');
  myFont3 = loadFont('BebasKai.ttf');
  fondoImg = loadImage("FONDO.jpg");
  bgMusic = loadSound("musicaFondo.mp3");
  voicePhrases = [
    loadSound("frase1.mp3"),
    loadSound("frase2.mp3"),
    loadSound("frase3.mp3"),
    loadSound("frase4.mp3"),
    loadSound("frase5.mp3"),
    loadSound("frase6.mp3"),
    loadSound("frase7.mp3"),
    loadSound("frase8.mp3"),
    loadSound("frase9.mp3"),
    loadSound("frase10.mp3"),
    loadSound("frase11.mp3"),
    loadSound("frase12.mp3"),
    loadSound("frase13.mp3"),
    loadSound("frase14.mp3"),
    loadSound("frase15.mp3"),
    loadSound("frase16.mp3"),
    loadSound("frase17.mp3"),
    loadSound("frase18.mp3"),
    loadSound("frase19.mp3"),
    loadSound("frase20.mp3"),
    loadSound("frase21.mp3"),
    loadSound("frase22.mp3")  
  ];
  
  // Cargar video para pantalla de descanso
  sleepVideo = createVideo(['sleep.mp4'], videoLoaded);
  sleepVideo.hide();
}

function setup() {
  createCanvas(1920, 1080);
  mic = new p5.AudioIn();
  mic.start();
  bgMusic.setVolume(bgMusicVolume);
  bgMusic.loop();
  createMenuUI();
  lastActivityTime = millis(); // Iniciar contador de actividad
  
  function keyPressed() {
  // Reiniciar temporizador de inactividad
  lastActivityTime = millis();
  
  // Saltar con BARRA ESPACIADORA (código 32)
  if (keyCode === 32 && playerY >= 800 && gameState === "playing") {
    velocity = -20; // Fuerza del salto (ajusta este valor)
    return false; // Previene comportamiento por defecto
  }
  
  // También puedes agregar otras teclas aquí
  // if (keyCode === TU_TECLA) { ... }
}
  
  // Estilo para botones
  let buttons = document.querySelectorAll('button');
  buttons.forEach(btn => {
    btn.style.backgroundColor = '#4CAF50';
    btn.style.color = 'white';
    btn.style.border = 'none';
    btn.style.padding = '10px 20px';
    btn.style.borderRadius = '5px';
    btn.style.cursor = 'pointer';
  });
}

function draw() {
  background(220);

  // Verificar inactividad (excepto cuando ya está en modo sleep)
  if (gameState !== "sleep" && millis() - lastActivityTime > sleepTimeout) {
    enterSleepMode();
  }

  if (gameState === "sleep") {
    // Pantalla de descanso
    image(sleepVideo, 0, 0, width, height);
    
    // Mostrar créditos
    fill(255, 255, 255, 200);
    noStroke();
    rect(width/2 - 300, height - 200, 600, 150, 20);
    
    fill(0);
    textAlign(CENTER);
    textSize(20);
    textFont(myFont2);
    text("PROYECTO SONORO", width/2, height - 170);
    textSize(18);
    text("PARA SONIDO Y MUSICALIZACION.", width/2, height - 150);
    textSize(16);
    text("con el maestro Miguel Nuñez.", width/2, height - 123);
    text("© " + new Date().getFullYear() + " - Desarrollado por:", width/2, height - 100);
    textSize(26);
    text("Booz Santana y Misael Genao", width/2, height - 70);
    
    

  } else if (gameState === "menu") {
    image(fondoImg, 0, 0, width, height);
    textFont(myFont); // Usa la fuente cargada
    textSize(58); // Tamaño en píxeles
    fill(0, 0, 0); // Color RGB (rojo en este caso)
    textAlign(CENTER); // Alineación horizontal y vertical
    text("VOCEANDO Y BRINCANDO", width / 2, 100);
    textSize(24);
    textFont(myFont3);
    text("MENU PRINCIPAL", width / 2, 150);
     textSize(18);
    text("Ingresa tu nombre y haz clic en Jugar", width / 2, 180);

    showRanking();

  } else if (gameState === "playing") {
    image(fondoImg, 0, 0, width, height);

    // Control por voz (actualiza tiempo de actividad)
    let vol = mic.getLevel();
    if (vol > 0.05) {
      lastActivityTime = millis();
      
      if (playerY >= 800) {
        let force = map(vol, 0.05, 0.3, -15, -30);
        velocity = force;
      }
    }

    // Física del jugador
    playerY += velocity;
    velocity += gravity;

    // Límites del jugador
    if (playerY > 800) {
      playerY = 800;
      velocity = 0;
    }
    if (playerY < 100) {
      playerY = 100;
      velocity = 0;
    }

    // Dibujar jugador y suelo
    image(logoImg, 180, playerY - 40, 80, 80);
    stroke(0);
    line(0, 820, width, 820);

    // Aumentar dificultad progresiva
    obstacleSpeed += speedIncreaseRate * deltaTime / 1000;

    // Manejo de obstáculos
    for (let i = obstacles.length - 1; i >= 0; i--) {
      let obs = obstacles[i];
      obs.x -= obstacleSpeed;
      
      // Eliminar obstáculos que salen de pantalla
      if (obs.x < -obs.w) {
        obstacles.splice(i, 1);
        score += 0.1;
        if (i === 0) addNewObstacle();
        continue;
      }
      
      // En la sección de control del juego (dentro de draw())
let vol = mic.getLevel();
if ((vol > 0.05 || keyIsPressed && keyCode === 32) && playerY >= 800) {
  let force = map(vol, 0.05, 0.3, -15, -30);
  if (keyIsPressed && keyCode === 32) {
    force = -25; // Fuerza fija cuando se usa tecla
  }
  velocity = force;
}
      // Dibujar obstáculos
      fill(obs.isTunnel ? color(50, 50, 255) : color(255, 50, 50));
      rect(obs.x, obs.y, obs.w, obs.h);
      
      // Detección de colisión
      if (checkCollision(obs)) {
        gameState = "gameover";
        saveScore();
        showGameOverUI();
        playRandomVoice();
        break;
      }
    }

    // Actualizar puntaje como cronómetro
    timeElapsed += deltaTime / 1000;
    score = timeElapsed;

    // Mostrar información del juego
    fill(0);
    textSize(24);
    textAlign(LEFT);
    text(`Jugador: ${playerName}`, 20, 40);
    text(`Puntaje: ${score.toFixed(2)}`, 20, 70);

  } else if (gameState === "gameover") {
    image(fondoImg, 0, 0, width, height);
    fill(0);
    textAlign(CENTER);
    textSize(48);
     fill(250, 0, 0); // Color RGB (rojo en este caso)
    text("¡Perdiste!", width / 2, height / 2 - 270);
    textSize(32);
    fill(0, 0, 0); // Color RGB (rojo en este caso)
    text(`${playerName} - Puntaje: ${score.toFixed(2)}`, width / 2, height / 2 - 240);

    // Mostrar ranking
    fill(20);
    textSize(24);
    text(`TOP 3:`, width / 2, height / 2 - 185);
    for (let i = 0; i < 3 && i < ranking.length; i++) {
      let entry = ranking[i];
      text(`${i + 1}. ${entry.name}: ${entry.score.toFixed(2)}`, width / 2, height / 2 - 165 + i * 30);
    }
  }
}

// Función para entrar en modo descanso
function enterSleepMode() {
  if (gameState !== "sleep") {
    gameState = "sleep";
    bgMusic.setVolume(bgMusicVolume * 0.3); // Reducir volumen
    
    // Configurar video de descanso
    sleepVideo.size(width, height);
    sleepVideo.loop();
    sleepVideo.volume(0);
    
    // Crear botón para continuar
    wakeButton = createButton("Continuar");
    wakeButton.position(width - 150, 50);
    wakeButton.mousePressed(wakeFromSleep);
    
    // Ocultar elementos de otros estados
    if (input) input.hide();
    if (startButton) startButton.hide();
    if (restartButton) restartButton.hide();
    if (menuButton) menuButton.hide();
  }
}

// Función para salir del modo descanso
function wakeFromSleep() {
  gameState = "menu";
  lastActivityTime = millis();
  bgMusic.setVolume(bgMusicVolume);
  sleepVideo.stop();
  if (wakeButton) wakeButton.hide();
  
  // Mostrar elementos del menú
  input.show();
  startButton.show();
}

// Función para verificar colisiones
function checkCollision(obs) {
  let playerRight = 200 + 40;
  let playerLeft = 200 - 40;
  let playerBottom = playerY + 40;
  let playerTop = playerY - 40;
  
  let obstacleRight = obs.x + obs.w;
  let obstacleLeft = obs.x;
  let obstacleBottom = obs.y + obs.h;
  let obstacleTop = obs.y;
  
  return playerRight > obstacleLeft && 
         playerLeft < obstacleRight && 
         playerBottom > obstacleTop && 
         playerTop < obstacleBottom;
}

// Función para generar nuevos obstáculos
function addNewObstacle() {
  let isTunnel = random() < tunnelProbability;
  let gap = random(minGap, maxGap);
  
  if (isTunnel) {
    let tunnelHeight = random(160, 700);
    let tunnelY = random(400, 600);
    
    // Parte superior del túnel
    obstacles.push({
      x: lastObstacleX + gap,
      y: 0,
      w: 40,
      h: tunnelY - tunnelHeight/2,
      isTunnel: true
    });
    
    // Parte inferior del túnel
    obstacles.push({
      x: lastObstacleX + gap,
      y: tunnelY + tunnelHeight/2,
      w: 40,
      h: height - (tunnelY + tunnelHeight/2),
      isTunnel: true
    });
    
    lastObstacleX += gap + 40;
  } else {
    // Obstáculo normal
    obstacles.push({
      x: lastObstacleX + gap,
      y: 800,
      w: 60,
      h: 140,
      isTunnel: false
    });
    lastObstacleX += gap + 40;
  }
}

// Función para reiniciar el juego
function resetGame() {
  playerY = 800;
  velocity = 0;
  score = 0;
  timeElapsed = 0;
  gameOver = false;
  obstacleSpeed = 8;
  lastObstacleX = width;

  obstacles = [];
  // Generar obstáculos iniciales
  for (let i = 0; i < 3; i++) {
    addNewObstacle();
  }
  
  if (restartButton) restartButton.hide();
  if (menuButton) menuButton.hide();
}

// Función para mostrar el ranking
function showRanking() {
  let boxX = width / 2 - 200;
  let boxY = 200;
  let boxW = 400;
  let boxH = 300;

  fill(255, 255, 255, 200);
  stroke(0);
  rect(boxX, boxY, boxW, boxH, 20);
  fill(0);
  textSize(20);
  textAlign(CENTER);
  text("Ranking:", width / 2, boxY + 30);

  push();
  let visibleEntries = 10;
  for (let i = 0; i < ranking.length && i < visibleEntries; i++) {
    let entry = ranking[i];
    let y = boxY + 60 + i * 24;
    if (i === 0) fill("gold");
    else if (i === 1) fill("silver");
    else if (i === 2) fill("#cd7f32"); // Bronce
    else fill(0);
    text(`${i + 1}. ${entry.name}: ${entry.score.toFixed(2)}`, width / 2, y);
  }
  pop();
}

// Función para guardar puntaje
function saveScore() {
  ranking.push({ name: playerName, score: score });
  ranking.sort((a, b) => b.score - a.score);
  // Mantener solo los 10 mejores
  if (ranking.length > 10) {
    ranking = ranking.slice(0, 10);
  }
}

// Función para mostrar interfaz de Game Over
function showGameOverUI() {
  restartButton = createButton("Jugar de nuevo");
  restartButton.position(width / 2 - 100, height / 2 - 50);
  restartButton.mousePressed(() => {
    stopVoice();
    resetGame();
    gameState = "playing";
    lastActivityTime = millis();
  });

  menuButton = createButton("Volver al menú");
  menuButton.position(width / 2 - 80, height / 2 + 10);
  menuButton.mousePressed(() => {
    stopVoice();
    gameState = "menu";
    input.show();
    startButton.show();
    restartButton.hide();
    menuButton.hide();
    lastActivityTime = millis();
  });
}

// Función para reproducir frases aleatorias
function playRandomVoice() {
  if (currentVoice && currentVoice.isPlaying()) {
    currentVoice.stop();
  }
  let idx = floor(random(voicePhrases.length));
  currentVoice = voicePhrases[idx];
  currentVoice.setVolume(1);
  currentVoice.play();
}

// Función para detener frases de voz
function stopVoice() {
  if (currentVoice && currentVoice.isPlaying()) {
    currentVoice.stop();
  }
}

// Función cuando el video se carga
function videoLoaded() {
  console.log("Video de descanso cargado");
}

// Eventos de interacción para resetear inactividad
function mouseMoved() {
  lastActivityTime = millis();
  if (gameState === "sleep") {
    wakeFromSleep();
  }
}

function keyPressed() {
  lastActivityTime = millis();
  if (gameState === "sleep") {
    wakeFromSleep();
  }
}
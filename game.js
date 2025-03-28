// Game Constants
const GAME_WIDTH = 800;
const GAME_HEIGHT = 500;
const GRAVITY = 0.5;
const FLOOR = GAME_HEIGHT - 50;

// Game State
let gameRunning = false;
let gameTime = 60;
let timerInterval;

// DOM Elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const timerDisplay = document.querySelector('.timer');
const playerHealth = document.querySelector('.player .health-fill');
const enemyHealth = document.querySelector('.enemy .health-fill');

// Set canvas dimensions
canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;

// Character Class
class Fighter {
    constructor(x, y, isPlayer) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 100;
        this.velocityY = 0;
        this.velocityX = 0;
        this.isJumping = false;
        this.health = 100;
        this.isPlayer = isPlayer;
        this.attacking = false;
        this.attackCooldown = 0;
        this.facingRight = isPlayer;
    }

    draw() {
        // Draw stick figure
        ctx.fillStyle = this.isPlayer ? '#3498db' : '#e74c3c';
        
        // Head
        ctx.beginPath();
        ctx.arc(this.x, this.y - 60, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Body
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - 45);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Arms
        const armAngle = this.attacking ? (this.facingRight ? -Math.PI/4 : Math.PI/4) : 0;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - 40);
        ctx.lineTo(this.x + 30 * Math.cos(armAngle), this.y - 40 + 30 * Math.sin(armAngle));
        ctx.lineTo(this.x + 30 * Math.cos(armAngle + Math.PI/4), this.y - 40 + 30 * Math.sin(armAngle + Math.PI/4));
        ctx.stroke();
        
        // Legs
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - 20, this.y + 30);
        ctx.lineTo(this.x - 20, this.y + 30);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + 20, this.y + 30);
        ctx.lineTo(this.x + 20, this.y + 30);
        ctx.stroke();
    }

    update() {
        // Apply gravity
        this.velocityY += GRAVITY;
        
        // Update position
        this.y += this.velocityY;
        this.x += this.velocityX;
        
        // Floor collision
        if (this.y > FLOOR - this.height/2) {
            this.y = FLOOR - this.height/2;
            this.velocityY = 0;
            this.isJumping = false;
        }
        
        // Boundary check
        this.x = Math.max(this.width/2, Math.min(GAME_WIDTH - this.width/2, this.x));
        
        // Attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
        } else {
            this.attacking = false;
        }
    }

    jump() {
        if (!this.isJumping) {
            this.velocityY = -12;
            this.isJumping = true;
        }
    }

    attack() {
        if (this.attackCooldown === 0) {
            this.attacking = true;
            this.attackCooldown = 20;
            
            // Check for hit
            if (this.isPlayer) {
                if (Math.abs(this.x - enemy.x) < 60 && Math.abs(this.y - enemy.y) < 40) {
                    enemy.takeDamage(10);
                }
            } else {
                if (Math.abs(this.x - player.x) < 60 && Math.abs(this.y - player.y) < 40) {
                    player.takeDamage(10);
                }
            }
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health < 0) this.health = 0;
        
        // Update health bar
        if (this.isPlayer) {
            playerHealth.style.width = `${this.health}%`;
        } else {
            enemyHealth.style.width = `${this.health}%`;
        }
        
        // Knockback effect
        this.velocityX = this.isPlayer ? -5 : 5;
    }
}

// Create fighters
const player = new Fighter(200, FLOOR, true);
const enemy = new Fighter(600, FLOOR, false);

// Game Loop
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // Draw background
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // Draw floor
    ctx.fillStyle = '#333';
    ctx.fillRect(0, FLOOR, GAME_WIDTH, GAME_HEIGHT - FLOOR);
    
    // Update and draw characters
    player.update();
    enemy.update();
    player.draw();
    enemy.draw();
    
    // Simple AI for enemy
    if (gameRunning && !enemy.attacking && Math.random() < 0.01) {
        enemy.attack();
    }
    
    // Check game over
    if (player.health <= 0 || enemy.health <= 0 || gameTime <= 0) {
        endGame();
    } else {
        requestAnimationFrame(gameLoop);
    }
}

// Start Game
function startGame() {
    gameRunning = true;
    startBtn.style.display = 'none';
    
    // Reset game state
    player.health = 100;
    enemy.health = 100;
    playerHealth.style.width = '100%';
    enemyHealth.style.width = '100%';
    gameTime = 60;
    timerDisplay.textContent = gameTime;
    
    // Start timer
    timerInterval = setInterval(() => {
        gameTime--;
        timerDisplay.textContent = gameTime;
    }, 1000);
    
    // Start game loop
    gameLoop();
}

// End Game
function endGame() {
    gameRunning = false;
    clearInterval(timerInterval);
    
    let message = '';
    if (player.health <= 0) {
        message = 'YOU LOSE!';
    } else if (enemy.health <= 0) {
        message = 'YOU WIN!';
    } else {
        message = 'TIME UP!';
    }
    
    startBtn.textContent = message + ' PLAY AGAIN?';
    startBtn.style.display = 'block';
}

// Event Listeners
startBtn.addEventListener('click', startGame);

// Keyboard Controls
window.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    
    switch(e.key) {
        case 'ArrowLeft':
            player.velocityX = -5;
            player.facingRight = false;
            break;
        case 'ArrowRight':
            player.velocityX = 5;
            player.facingRight = true;
            break;
        case 'ArrowUp':
            player.jump();
            break;
        case ' ':
            player.attack();
            break;
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        player.velocityX = 0;
    }
});
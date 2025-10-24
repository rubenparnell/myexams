        const gameToggle = document.getElementById("gameToggle");
        let gameRunning = false;
        const scoreElement = document.getElementById("score");
        const scoreHeading = scoreElement.previousElementSibling;
        const menuToggle = document.getElementById("menuToggle");
        const settingsMenu = document.getElementById("settingsMenu");
    
        gameToggle.addEventListener("change", () => {
            gameRunning = gameToggle.checked;
            if (gameRunning) {
                scoreElement.style.display = "block";
                scoreHeading.style.display = "block";
                menuToggle.style.display = "block";
                animate();
            } else {
                scoreElement.style.display = "none";
                scoreHeading.style.display = "none";
                menuToggle.style.display = "none";
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        });

        menuToggle.addEventListener("click", () => {
            settingsMenu.style.display = settingsMenu.style.display === "none" ? "block" : "none";
        });

        document.getElementById("ballCount").addEventListener("input", updateSettings);
        document.getElementById("ballSpeed").addEventListener("input", updateSettings);
        document.getElementById("cursorRadius").addEventListener("input", updateSettings);

        function updateSettings() {
            particleCount = parseInt(document.getElementById("ballCount").value);
            particleSpeed = parseFloat(document.getElementById("ballSpeed").value);
            mouse.radius = parseInt(document.getElementById("cursorRadius").value);
        
            particles.forEach(particle => {
                particle.setSpeed();  // Use the method to reset the speed properly
            });
        
            init();  // Reinitialize to reflect the new settings
        }        

        const canvas = document.getElementById("fabricCanvas");
        const ctx = canvas.getContext("2d");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let particles = [];
        let score = 0;
        const scoreDisplay = document.getElementById("score");
        const mouse = { x: null, y: null, radius: 150 };
        const cards = document.querySelectorAll(".card");
        let cardRects = [];

        particleCount = parseInt(document.getElementById("ballCount").value);
        particleSpeed = parseFloat(document.getElementById("ballSpeed").value);
        mouse.radius = parseInt(document.getElementById("cursorRadius").value);

        function updateCardRects() {
            cardRects = Array.from(cards).map(card => card.getBoundingClientRect());
        }

        class Particle {
            constructor() {
                this.radius = Math.random() * 6 + 4;
                this.color = "#0d6efd"; 
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.setSpeed();
                this.pushedByMouse = false; // Track if the particle was pushed by the mouse
            }
        
            setSpeed() {
                const angle = Math.random() * Math.PI * 2;
                let speed = particleSpeed * (0.5 + Math.random() * 0.5);
                this.vx = Math.cos(angle) * speed;
                this.vy = Math.sin(angle) * speed;
            }            
        
            move() {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < mouse.radius) {
                    let forceDirectionX = dx / distance;
                    let forceDirectionY = dy / distance;
                    let force = (mouse.radius - distance) / mouse.radius;
                    this.x -= forceDirectionX * force * 5;
                    this.y -= forceDirectionY * force * 5;
                    this.pushedByMouse = true;  // Mark as pushed
                }
        
                this.x += this.vx;
                this.y += this.vy;
        
                // Check if off-screen only if pushed by mouse
                if (this.pushedByMouse && (this.x < -this.radius || this.x > canvas.width + this.radius || 
                    this.y < -this.radius || this.y > canvas.height + this.radius)) {
                    this.respawn();
                }
        
                // Bounce off walls
                if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) {
                    this.vx = -this.vx;
                }
                if (this.y - this.radius < 0 || this.y + this.radius > canvas.height) {
                    this.vy = -this.vy;
                }
        
                cardRects.forEach(rect => {
                    if (
                        this.x + this.radius > rect.left &&
                        this.x - this.radius < rect.right &&
                        this.y + this.radius > rect.top &&
                        this.y - this.radius < rect.bottom
                    ) {
                        const dxL = Math.abs(this.x - rect.left);
                        const dxR = Math.abs(this.x - rect.right);
                        const dyT = Math.abs(this.y - rect.top);
                        const dyB = Math.abs(this.y - rect.bottom);
        
                        const minDist = Math.min(dxL, dxR, dyT, dyB);
        
                        if (minDist === dxL || minDist === dxR) {
                            this.vx = -this.vx;
                        } else {
                            this.vy = -this.vy;
                        }
        
                        this.keepOutside(rect);
                    }
                });
            }
        
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        
            respawn() {
                score++;
                scoreDisplay.textContent = score;
            
                do {
                    this.x = Math.random() * canvas.width;
                    this.y = Math.random() * canvas.height;
                } while (this.isInsideAnyCard());
            
                this.setSpeed();
            }            
        
            isInsideAnyCard() {
                return cardRects.some(rect =>
                    this.x > rect.left - this.radius &&
                    this.x < rect.right + this.radius &&
                    this.y > rect.top - this.radius &&
                    this.y < rect.bottom + this.radius
                );
            }
        
            keepOutside(rect) {
                if (this.x < rect.left) this.x = rect.left - this.radius;
                if (this.x > rect.right) this.x = rect.right + this.radius;
                if (this.y < rect.top) this.y = rect.top - this.radius;
                if (this.y > rect.bottom) this.y = rect.bottom + this.radius;
            }
        }
        
        function init() {
            updateCardRects();
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }

        function animate() {
            if (!gameRunning) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(particle => {
                particle.move();
                particle.draw();
            });
            requestAnimationFrame(animate);
        }

        window.addEventListener("resize", () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            updateCardRects();
            init();
        });

        window.addEventListener("mousemove", event => {
            mouse.x = event.x;
            mouse.y = event.y;
        });

        window.addEventListener("touchmove", event => {
            let touch = event.touches[0];
            mouse.x = touch.clientX;
            mouse.y = touch.clientY;
        });

        window.addEventListener("touchend", () => {
            mouse.x = null;
            mouse.y = null;
        });

        init();
        animate();

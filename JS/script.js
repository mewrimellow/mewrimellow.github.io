// Global Variables
let currentUser = null;
let users = [];
let isLoggedIn = false;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
    setupEventListeners();
    initializeDemoUsers();
});

// Initialize Application
function initializeApp() {
    // Load data from localStorage
    users = JSON.parse(localStorage.getItem('pixelhive_users') || '[]');
    isLoggedIn = JSON.parse(localStorage.getItem('pixelhive_logged_in') || 'false');

    const savedUser = localStorage.getItem('pixelhive_current_user');
    if (isLoggedIn && savedUser) {
        currentUser = JSON.parse(savedUser);
        updateAuthUI(true);
    } else {
        updateAuthUI(false);
    }

    // Initialize scroll animations
    initScrollAnimations();
}

// Setup Event Listeners
function setupEventListeners() {
    // Auth Form Listeners
    setupAuthFormListeners();

    // Search functionality
    setupSearchListeners();

    // Keyboard shortcuts
    setupKeyboardListeners();

    // Modal click outside to close
    setupModalListeners();

    // Game card listeners
    setupGameListeners();

    // Header scroll effect
    setupScrollEffects();

    // Window resize handler
    window.addEventListener('resize', handleResize);
}

// Authentication Functions
function openLogin() {
    closeAllModals();
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function openRegister() {
    closeAllModals();
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeAuth() {
    const modals = document.querySelectorAll('.auth-modal');
    modals.forEach(modal => modal.classList.remove('active'));
    document.body.style.overflow = 'auto';
}

function switchToLogin() {
    closeAuth();
    setTimeout(() => openLogin(), 100);
}

function switchToRegister() {
    closeAuth();
    setTimeout(() => openRegister(), 100);
}

function showForgotPassword() {
    closeAuth();
    const modal = document.getElementById('forgotModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Password Toggle Function
function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    const button = field?.parentElement?.querySelector('.toggle-password');

    if (field && button) {
        if (field.type === 'password') {
            field.type = 'text';
            button.textContent = '🙈';
        } else {
            field.type = 'password';
            button.textContent = '👁️';
        }
    }
}

// Login Function
function performLogin(identifier, password, rememberMe) {
    const user = users.find(u =>
        u.email.toLowerCase() === identifier.toLowerCase() ||
        u.username.toLowerCase() === identifier.toLowerCase()
    );

    if (!user) {
        throw new Error('Usuário não encontrado');
    }

    if (user.password !== password) {
        throw new Error('Senha incorreta');
    }

    // Set logged in user
    currentUser = { ...user };
    delete currentUser.password; // Remove password from memory

    isLoggedIn = true;
    localStorage.setItem('pixelhive_logged_in', 'true');
    localStorage.setItem('pixelhive_current_user', JSON.stringify(currentUser));

    if (rememberMe) {
        localStorage.setItem('pixelhive_remember_me', 'true');
    }

    return currentUser;
}

// Register Function
function performRegister(userData) {
    // Check if user exists
    const userExists = users.some(user =>
        user.email.toLowerCase() === userData.email.toLowerCase() ||
        user.username.toLowerCase() === userData.username.toLowerCase()
    );

    if (userExists) {
        throw new Error('Usuário já existe');
    }

    // Create new user
    const newUser = {
        id: Date.now(),
        firstName: userData.firstName,
        lastName: userData.lastName,
        username: userData.username,
        email: userData.email,
        password: userData.password,
        birthDate: userData.birthDate,
        newsletter: userData.newsletter || false,
        createdAt: new Date().toISOString(),
        level: 1,
        gamesPlayed: 0,
        totalTime: '0h',
        achievements: ['first_registration'],
        favorites: [],
        recentGames: []
    };

    users.push(newUser);
    localStorage.setItem('pixelhive_users', JSON.stringify(users));

    // Auto login
    currentUser = { ...newUser };
    delete currentUser.password;

    isLoggedIn = true;
    localStorage.setItem('pixelhive_logged_in', 'true');
    localStorage.setItem('pixelhive_current_user', JSON.stringify(currentUser));

    return currentUser;
}

// Logout Function
function logout() {
    currentUser = null;
    isLoggedIn = false;

    localStorage.setItem('pixelhive_logged_in', 'false');
    localStorage.removeItem('pixelhive_current_user');
    localStorage.removeItem('pixelhive_remember_me');

    updateAuthUI(false);
    showWelcomeMessage('Logout realizado com sucesso! Até logo! 👋');
}

// Update UI based on auth state
function updateAuthUI(loggedIn) {
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const profileLink = document.getElementById('profileLink');
    const logoutLink = document.getElementById('logoutLink');

    if (loggedIn && currentUser) {
        if (loginLink) loginLink.style.display = 'none';
        if (registerLink) registerLink.style.display = 'none';
        if (profileLink) profileLink.style.display = 'block';
        if (logoutLink) logoutLink.style.display = 'block';

        // Update profile info
        const usernameEl = document.getElementById('username');
        if (usernameEl) {
            usernameEl.textContent = currentUser.username || 'Usuário';
        }
    } else {
        if (loginLink) loginLink.style.display = 'block';
        if (registerLink) registerLink.style.display = 'none';
        if (profileLink) profileLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'none';
    }
}

// Show Welcome Message
function showWelcomeMessage(message, type = 'login') {
    const welcomeMsg = document.getElementById('welcomeMessage');
    const welcomeText = document.getElementById('welcomeText');

    if (welcomeMsg && welcomeText) {
        welcomeText.textContent = message;
        welcomeMsg.classList.add('show');

        setTimeout(() => {
            welcomeMsg.classList.remove('show');
        }, 4000);
    }
}

// Setup Auth Form Listeners
function setupAuthFormListeners() {
    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const identifier = document.getElementById('loginEmail')?.value;
            const password = document.getElementById('loginPassword')?.value;
            const rememberMe = document.getElementById('rememberMe')?.checked;

            if (!identifier || !password) {
                alert('Por favor, preencha todos os campos');
                return;
            }

            try {
                const user = performLogin(identifier, password, rememberMe);
                updateAuthUI(true);
                closeAuth();
                showWelcomeMessage(`Bem-vindo de volta, ${user.username}! 🎉`);
            } catch (error) {
                alert('Erro no login: ' + error.message);
            }
        });
    }

    // Register Form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const userData = {
                firstName: document.getElementById('firstName')?.value,
                username: document.getElementById('registerUsername')?.value,
                email: document.getElementById('registerEmail')?.value,
                password: document.getElementById('registerPassword')?.value,
                birthDate: document.getElementById('birthDate')?.value,
                newsletter: document.getElementById('newsletter')?.checked
            };

            // Basic validation
            if (!userData.firstName || !userData.username ||
                !userData.email || !userData.password || !userData.birthDate) {
                alert('Por favor, preencha todos os campos obrigatórios');
                return;
            }


            // Terms agreement
            const agreeTerms = document.getElementById('agreeTerms')?.checked;
            if (!agreeTerms) {
                alert('Você deve concordar com os Termos de Uso');
                return;
            }

            try {
                const user = performRegister(userData);
                updateAuthUI(true);
                closeAuth();
                showWelcomeMessage(`Bem-vindo ao PixelHive, ${user.username}! 🎉`);
            } catch (error) {
                alert('Erro no cadastro: ' + error.message);
            }
        });
    }

    // Password strength checker
    const registerPassword = document.getElementById('registerPassword');
    if (registerPassword) {
        registerPassword.addEventListener('input', function () {
            checkPasswordStrength(this.value);
        });
    }

    // Username availability checker
    const registerUsername = document.getElementById('registerUsername');
    if (registerUsername) {
        registerUsername.addEventListener('blur', function () {
            if (this.value.length > 0) {
                checkUsernameAvailability(this.value);
            }
        });
    }
}

// Password Strength Checker
function checkPasswordStrength(password) {
    const strengthBar = document.querySelector('.strength-fill');
    const strengthText = document.querySelector('.strength-text');

    if (!strengthBar || !strengthText) return;

    let score = 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (password.length === 0) {
        strengthBar.className = 'strength-fill';
        strengthText.textContent = 'Digite uma senha';
        return;
    }

    if (score <= 2) {
        strengthBar.className = 'strength-fill weak';
        strengthText.textContent = 'Senha fraca';
    } else if (score <= 3) {
        strengthBar.className = 'strength-fill fair';
        strengthText.textContent = 'Senha razoável';
    } else if (score <= 4) {
        strengthBar.className = 'strength-fill good';
        strengthText.textContent = 'Senha boa';
    } else {
        strengthBar.className = 'strength-fill strong';
        strengthText.textContent = 'Senha forte';
    }
}

// Username availability checker
function checkUsernameAvailability(username) {
    const feedback = document.getElementById('usernameFeedback');
    if (!feedback) return;

    if (username.length < 3) {
        feedback.textContent = 'Nome de usuário deve ter pelo menos 3 caracteres';
        feedback.className = 'input-feedback error';
        return false;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        feedback.textContent = 'Apenas letras, números e underscore são permitidos';
        feedback.className = 'input-feedback error';
        return false;
    }

    const userExists = users.some(user =>
        user.username.toLowerCase() === username.toLowerCase()
    );

    if (userExists) {
        feedback.textContent = 'Este nome de usuário já está em uso';
        feedback.className = 'input-feedback error';
        return false;
    } else {
        feedback.textContent = 'Nome de usuário disponível';
        feedback.className = 'input-feedback success';
        return true;
    }
}

// Profile Functions
function openProfile() {
    if (!isLoggedIn || !currentUser) {
        openLogin();
        return;
    }

    const modal = document.getElementById('profileModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        updateProfileData();
    }
}

function closeProfile() {
    const modal = document.getElementById('profileModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function updateProfileData() {
    if (!currentUser) return;

    const usernameInput = document.getElementById('usernameInput');
    if (usernameInput) {
        usernameInput.value = currentUser.username || '';
    }

    const emailInput = document.getElementById('emailInput');
    if (emailInput) {
        emailInput.value = currentUser.email || '';
    }
}

function switchTab(tabName) {
    // Remove active class from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn =>
        btn.classList.remove('active')
    );
    document.querySelectorAll('.tab-content').forEach(content =>
        content.classList.remove('active')
    );

    // Add active class to selected tab
    const clickedTab = document.querySelector(`[onclick="switchTab('${tabName}')"]`);
    const targetContent = document.getElementById(tabName);

    if (clickedTab && targetContent) {
        clickedTab.classList.add('active');
        targetContent.classList.add('active');
    }
}

function saveProfile() {
    if (!currentUser) return;

    const username = document.getElementById('usernameInput')?.value;
    const email = document.getElementById('emailInput')?.value;

    if (username && email) {
        currentUser.username = username;
        currentUser.email = email;

        localStorage.setItem('pixelhive_current_user', JSON.stringify(currentUser));

        // Update in users array
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex].username = username;
            users[userIndex].email = email;
            localStorage.setItem('pixelhive_users', JSON.stringify(users));
        }

        // Update UI
        updateAuthUI(true);
        showWelcomeMessage('Perfil atualizado com sucesso! 🎉');
    }
}

function changeAvatar() {
    const avatars = [
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23ff6b35'/%3E%3Ctext x='50' y='60' font-family='Arial' font-size='40' fill='white' text-anchor='middle'%3EG%3C/text%3E%3C/svg%3E",
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%2300d4ff'/%3E%3Ctext x='50' y='60' font-family='Arial' font-size='40' fill='white' text-anchor='middle'%3EP%3C/text%3E%3C/svg%3E",
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23ffa726'/%3E%3Ctext x='50' y='60' font-family='Arial' font-size='40' fill='white' text-anchor='middle'%3EX%3C/text%3E%3C/svg%3E"
    ];

    const currentAvatar = document.getElementById('avatarImg');
    if (currentAvatar) {
        const currentIndex = avatars.indexOf(currentAvatar.src);
        const nextIndex = (currentIndex + 1) % avatars.length;
        currentAvatar.src = avatars[nextIndex];

        // Animation effect
        currentAvatar.style.transform = 'scale(0.8)';
        setTimeout(() => {
            currentAvatar.style.transform = 'scale(1)';
        }, 150);
    }
}

// Sidebar Functions
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
        sidebar.classList.toggle('active');
    } else {
        sidebar.classList.toggle('hidden');
    }
}

// ======================
// 🎮 GAMEMONETIZE API INTEGRATION
// ======================

// URLs da API GameMonetize por categoria
const GAME_FEEDS = {
    all: ["https://gamemonetize.com/feed.php?format=1&num=200&page=1"],
    action: ["https://gamemonetize.com/feed.php?format=1&name=action&num=50&page=1"],
    adventure: ["https://gamemonetize.com/feed.php?format=1&category=4&num=50&page=1", "https://gamemonetize.com/feed.php?format=1&name=watergirl&category=4&num=100&page=1"],
    puzzle: ["https://gamemonetize.com/feed.php?format=1&name=puzzle&num=50&page=1"],
    girls: [
        "https://gamemonetize.com/feed.php?format=1&name=dress&category=10&num=100&page=1",
        "https://gamemonetize.com/feed.php?format=1&name=date&category=10&num=100&page=1"
    ],
    racing: ["https://gamemonetize.com/feed.php?format=1&name=rac&category=14&num=100&page=1", "https://gamemonetize.com/feed.php?format=1&name=car&category=14&num=100&page=1"],
    sports: ["https://gamemonetize.com/feed.php?format=1&category=17&num=50&page=1"],
    arcade: ["https://gamemonetize.com/feed.php?format=1&name=Horror Eyes Escape&num=100&page=1",
        "https://gamemonetize.com/feed.php?format=1&name=Escape Your Birthday&num=50&page=1",
        "https://gamemonetize.com/feed.php?format=1&name=Escape The TEMPLE&page=1",
        "https://gamemonetize.com/feed.php?format=1&name=Grimace Birthday Escape&page=1",
        "https://gamemonetize.com/feed.php?format=1&name=Stickman Story&page=1",
        "https://gamemonetize.com/feed.php?format=1&name=Ghost Bunker Escape 2&page=1",
        "https://gamemonetize.com/feed.php?format=1&name=Ghost Town Escape&page=1",
        "https://gamemonetize.com/feed.php?format=1&name=Samurai Escape&page=1",

        "https://gamemonetize.com/feed.php?format=1&name=3 Minutes To Escape&page=1",

        "https://gamemonetize.com/feed.php?format=1&name=tower escape&page=1"
    ],
    simulation: ["https://gamemonetize.com/feed.php?format=1&name=restaurant&num=100&page=1"],

    flipline: ["custom:flipline"]
};




// Classe para gerenciar jogos da GameMonetize
class GameMonetizeAPI {
    constructor() {
        this.proxyUrl = 'https://api.allorigins.win/raw?url=';
        this.currentGames = [];
        this.isLoading = false;
    }

    // Buscar jogos por categoria
    async fetchGamesByCategory(category = 'all') {
        let feedUrls = GAME_FEEDS[category];
        if (!feedUrls) {
            throw new Error('Categoria não encontrada');
        }

        // Asegurarse de que feedUrls sea un array
        if (!Array.isArray(feedUrls)) feedUrls = [feedUrls];

        // 👉 CASO ESPECIAL: categoría custom
        if (feedUrls[0].startsWith("custom:")) {
            let customGames = [];

            if (feedUrls[0] === "custom:flipline") {
                const response = await fetch("/data/flipline.json");
                const customGames = await response.json();
                this.currentGames = customGames;
                this.renderGames(customGames);
                return customGames;
            }
            

            this.currentGames = customGames;
            this.renderGames(customGames);
            return customGames;

        }

        // Si no es custom, seguir con feeds normales de GameMonetize
        this.isLoading = true;
        this.showLoadingState();

        try {
            let allGames = [];

            // Iterar por cada feed
            for (const url of feedUrls) {
                const proxyUrl = this.proxyUrl + encodeURIComponent(url);
                const response = await fetch(proxyUrl);
                const xmlText = await response.text();

                // Parse XML
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmlText, "application/xml");
                const items = xmlDoc.getElementsByTagName("item");

                if (items && items.length > 0) {
                    const games = Array.from(items).map((item, index) => ({
                        id: item.getElementsByTagName("id")[0]?.textContent || `game-${index}`,
                        title: item.getElementsByTagName("title")[0]?.textContent || "Jogo sem título",
                        description: item.getElementsByTagName("description")[0]?.textContent || "Descrição não disponível",
                        url: item.getElementsByTagName("url")[0]?.textContent || "#",
                        thumb: item.getElementsByTagName("thumb")[0]?.textContent || "/placeholder.jpg",
                        width: item.getElementsByTagName("width")[0]?.textContent || 800,
                        height: item.getElementsByTagName("height")[0]?.textContent || 600,
                        category: category,
                        rating: this.generateRating(),
                        players: this.generatePlayerCount()
                    }));
                    allGames = allGames.concat(games);
                }
            }

            this.currentGames = allGames;

            if (allGames.length === 0) {
                this.showEmptyState(category);
            } else {
                this.renderGames(allGames);
            }

            return allGames;

        } catch (error) {
            console.error('Erro ao carregar jogos:', error);
            this.showErrorState();
            return [];
        } finally {
            this.isLoading = false;
        }
    }


    // Generar rating aleatorio (4-5 estrellas)
    generateRating() {
        const ratings = ['★★★★☆', '★★★★★', '★★★★☆', '★★★★★'];
        return ratings[Math.floor(Math.random() * ratings.length)];
    }

    // Generar conteo de jugadores
    generatePlayerCount() {
        return Math.floor(Math.random() * 200000) + 10000;
    }

    // Mostrar estado de carga
    showLoadingState() {
        const container = document.getElementById('gamesGrid');
        if (container) {
            container.innerHTML = `
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <h3>Carregando jogos incríveis...</h3>
                    <p>Preparando sua próxima aventura! 🎮</p>
                </div>
            `;
        }
    }

    // Mostrar estado vacío
    showEmptyState(category) {
        const container = document.getElementById('gamesGrid');
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🎮</div>
                    <h3>Nenhum jogo encontrado</h3>
                    <p>Não encontramos jogos na categoria "${category}".</p>
                    <button onclick="filterGames('all')" class="empty-btn">Ver todos os jogos</button>
                </div>
            `;
        }
    }

    // Mostrar estado de error
    showErrorState() {
        const container = document.getElementById('gamesGrid');
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">⚠️</div>
                    <h3>Ops! Algo deu errado</h3>
                    <p>Não conseguimos carregar os jogos. Tente novamente.</p>
                    <button onclick="filterGames('all')" class="error-btn">Tentar novamente</button>
                </div>
            `;
        }
    }

    // Renderizar juegos
    renderGames(games) {
        const container = document.getElementById('gamesGrid');
        if (!container) return;

        container.innerHTML = '';

        games.forEach(game => {
            const gameCard = this.createGameCard(game);

            // Botón de play
            const playButton = gameCard.querySelector(".play-button");
            if (playButton) {
                playButton.addEventListener("click", () => {
                    const jogoData = {
                        id: game.id || "",
                        title: game.title || "Sem título",
                        description: game.description || "Sem descrição.",
                        url: game.url || "#",
                        thumb: game.thumb || "",
                        width: game.width || 800,
                        height: game.height || 600
                    };

                    localStorage.setItem("jogoSelecionado", JSON.stringify(jogoData));
                    window.location.href = "HTML/juego.html";
                });
            }

            container.appendChild(gameCard);
        });

        this.initializeCardAnimations();
    }




    // Criar card do jogo com design do PixelHive
    createGameCard(game) {
        const card = document.createElement('div');
        card.className = 'game-card fade-in';
        card.dataset.category = game.category;

        card.innerHTML = `
            <div class="game-thumbnail" style="background-image: url('${game.thumb}'); background-size: cover; background-position: center;">
                <div class="play-button">▶</div>
                <div class="game-overlay">
                    
                </div>
            </div>
            <div class="game-info">
                <h3 class="game-title">${this.truncateTitle(game.title)}</h3>
                <p class="game-category">${this.getCategoryDisplayName(game.category)}</p>
  
            </div>
        `;

        // Adicionar evento de clique
        card.addEventListener('click', () => {
            this.playGame(game);
        });

        // Adicionar animação de hover
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });

        return card;
    }

    // Truncar título se muito longo
    truncateTitle(title) {
        return title.length > 25 ? title.substring(0, 25) + '...' : title;
    }

    // Obter nome de exibição da categoria
    getCategoryDisplayName(category) {
        const categoryNames = {
            all: 'Todos',
            action: 'Ação',
            adventure: 'Aventura',
            puzzle: 'Puzzle',
            girls: 'Garotas',
            racing: 'Corrida',
            sports: 'Esportes',
            arcade: 'Arcade',
            simulation: 'Simulação'
        };
        return categoryNames[category] || 'Jogo';
    }

    // Formatar contagem de jogadores
    formatPlayerCount(count) {
        if (count >= 1000000) {
            return Math.floor(count / 1000000) + 'M';
        } else if (count >= 1000) {
            return Math.floor(count / 1000) + 'k';
        }
        return count.toString();
    }

    // Jogar jogo
    playGame(game) {
        if (!isLoggedIn) {
            showWelcomeMessage('Faça login para jogar! 🎮');
            openLogin();
            return;
        }

        // Salvar dados do jogo
        localStorage.setItem('currentGame', JSON.stringify(game));

        // Abrir modal do game player
        this.openGamePlayer(game);
    }

    // Abrir player do jogo
    openGamePlayer(game) {
        const modal = document.getElementById('gamePlayerModal');
        if (!modal) return;

        // Atualizar informações do jogo no header
        document.getElementById('gameTitle').textContent = game.title;
        document.getElementById('gameCategory').textContent = this.getCategoryDisplayName(game.category);
        document.getElementById('gameRating').innerHTML = `<span class="stars">${game.rating}</span>`;

        // Definir ícone do jogo
        const gameIcon = document.getElementById('gameIcon');
        gameIcon.src = game.thumb;
        gameIcon.alt = game.title;

        // Mostrar modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Carregar jogo no iframe
        this.loadGameInIframe(game);

        // Iniciar tracking da sessão
        if (gameManager) {
            gameManager.currentGame = game;
            gameManager.startGameSession();
        }
    }

    // Carregar jogo no iframe
    loadGameInIframe(game) {
        const loading = document.getElementById('gameLoading');
        const iframe = document.getElementById('gameIframe');
        const fallback = document.getElementById('gameFallback');

        // Mostrar loading
        loading.style.display = 'block';
        iframe.style.display = 'none';
        fallback.style.display = 'none';

        // Configurar iframe
        iframe.src = game.url;
        iframe.width = game.width || 800;
        iframe.height = game.height || 600;

        // Evento de carregamento
        iframe.onload = () => {
            setTimeout(() => {
                loading.style.display = 'none';
                iframe.style.display = 'block';
            }, 1000);
        };

        // Fallback se não carregar em 10 segundos
        setTimeout(() => {
            if (iframe.style.display === 'none') {
                loading.style.display = 'none';
                fallback.style.display = 'block';
                this.createDemoGame();
            }
        }, 10000);
    }

    // Criar jogo demo como fallback
    createDemoGame() {
        const demoContainer = document.getElementById('demoGame');
        if (!demoContainer) return;

        demoContainer.innerHTML = `
            <div class="demo-game-content">
                <h4>🎮 Demo: Snake Game</h4>
                <p>Use as setas para mover a cobrinha!</p>
                <div class="demo-controls">
                    <button onclick="alert('🐍 Cobrinha começou!')">▶ Jogar Demo</button>
                </div>
            </div>
        `;
    }

    // Inicializar animações dos cards
    initializeCardAnimations() {
        const cards = document.querySelectorAll('.game-card.fade-in');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('visible');
            }, index * 100);
        });
    }

    // Buscar jogos (método público)
    async searchGames(query) {
        const allGames = await this.fetchGamesByCategory('all');
        const filteredGames = allGames.filter(game =>
            game.title.toLowerCase().includes(query.toLowerCase()) ||
            game.description.toLowerCase().includes(query.toLowerCase())
        );

        this.renderGames(filteredGames);
        return filteredGames;
    }
}

// Instância global da API
const gameMonetizeAPI = new GameMonetizeAPI();

// ======================
// 🔄 ATUALIZAR FUNÇÃO EXISTENTE
// ======================

// Atualizar função de filtro para usar a nova API
async function filterGames(category) {
    const sidebarItems = document.querySelectorAll('.category-item');

    // Atualizar sidebar
    sidebarItems.forEach(item => item.classList.remove('active'));
    const clickedItem = document.querySelector(`[data-category="${category}"]`);
    if (clickedItem) {
        clickedItem.classList.add('active');
    }

    // Carregar jogos da API
    try {
        await gameMonetizeAPI.fetchGamesByCategory(category);
    } catch (error) {
        console.error('Erro ao filtrar jogos:', error);
        gameMonetizeAPI.showErrorState();
    }

    // Fechar sidebar no mobile
    if (window.innerWidth <= 768) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.remove('active');
        }
    }
}


// Atualizar função de fechamento do jogo
function closeGame() {
    const modal = document.getElementById('gamePlayerModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';

        // Parar iframe
        const iframe = document.getElementById('gameIframe');
        if (iframe) {
            iframe.src = '';
        }

        // Parar tracking
        if (gameManager) {
            gameManager.stopGameSession();
        }
    }
}

// Função para alternar favorito
function toggleFavorite() {
    const btn = document.getElementById('favoriteBtn');
    const icon = btn.querySelector('.btn-icon');

    if (icon.textContent === '🤍') {
        icon.textContent = '❤️';
        btn.querySelector('.btn-text').textContent = 'Favoritado';
        showWelcomeMessage('Jogo adicionado aos favoritos! ❤️');
    } else {
        icon.textContent = '🤍';
        btn.querySelector('.btn-text').textContent = 'Favoritar';
        showWelcomeMessage('Jogo removido dos favoritos');
    }
}

// Função para tela cheia
function toggleFullscreen() {
    const iframe = document.getElementById('gameIframe');
    if (!iframe) return;

    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        iframe.requestFullscreen().catch(err => {
            console.log('Erro ao entrar em tela cheia:', err);
        });
    }
}

// Pausar jogo
function pauseGame() {
    const btn = document.getElementById('pauseBtn');
    const icon = document.getElementById('pauseIcon');

    if (icon.textContent === '⏸️') {
        icon.textContent = '▶️';
        showWelcomeMessage('Jogo pausado');
    } else {
        icon.textContent = '⏸️';
        showWelcomeMessage('Jogo retomado');
    }
}

// Reiniciar jogo
function restartGame() {
    const iframe = document.getElementById('gameIframe');
    if (iframe && iframe.src) {
        iframe.src = iframe.src; // Recarrega o iframe
        showWelcomeMessage('Jogo reiniciado! 🔄');

        if (gameManager) {
            gameManager.startGameSession();
        }
    }
}

// Salvar jogo
function saveGame() {
    if (gameManager) {
        gameManager.saveProgress();
        showWelcomeMessage('Progresso salvo! 💾');
    }
}

// Compartilhar pontuação
function shareScore() {
    const gameTitle = document.getElementById('gameTitle').textContent;
    const score = document.getElementById('finalScore').textContent;

    const text = `🎮 Acabei de fazer ${score} pontos no ${gameTitle} no PixelHive!\n\nJogue também: ${window.location.origin}`;

    if (navigator.share) {
        navigator.share({
            title: 'Minha pontuação no PixelHive',
            text: text,
            url: window.location.origin
        });
    } else {
        navigator.clipboard.writeText(text).then(() => {
            showWelcomeMessage('Pontuação copiada para a área de transferência! 📋');
        });
    }
}

// ======================
// 🔍 ATUALIZAR BUSCA
// ======================

// Atualizar busca para usar a nova API
function setupSearchListeners() {
    const searchBox = document.querySelector('.search-box');

    if (searchBox) {
        searchBox.addEventListener('input', debounce(async function (e) {
            const searchTerm = e.target.value.toLowerCase().trim();

            if (searchTerm.length > 2) {
                try {
                    await gameMonetizeAPI.searchGames(searchTerm);

                    // Reset sidebar
                    document.querySelectorAll('.category-item').forEach(item =>
                        item.classList.remove('active')
                    );
                } catch (error) {
                    console.error('Erro na busca:', error);
                }
            } else if (searchTerm.length === 0) {
                // Restaurar todos os jogos
                await filterGames('all');
            }
        }, 500));
    }
}

// ======================
// ♻️ MANTER FUNÇÕES EXISTENTES
// ======================

// Todas as outras funções permanecem iguais...
// (Auth, Profile, Sidebar, etc.)

// View Switching
function changeView(viewType) {
    const gamesGrid = document.getElementById('gamesGrid');
    const viewButtons = document.querySelectorAll('.view-btn');

    if (!gamesGrid) return;

    // Update active button
    viewButtons.forEach(btn => btn.classList.remove('active'));
    const activeButton = document.querySelector(`[onclick="changeView('${viewType}')"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }

    // Toggle view
    if (viewType === 'list') {
        gamesGrid.classList.add('list-view');
    } else {
        gamesGrid.classList.remove('list-view');
    }
}

// Close all modals
function closeAllModals() {
    closeAuth();
    closeProfile();
}

// Search Setup
function setupSearchListeners() {
    const searchBox = document.querySelector('.search-box');

    if (searchBox) {
        searchBox.addEventListener('input', debounce(function (e) {
            const searchTerm = e.target.value.toLowerCase();
            const gameCards = document.querySelectorAll('.game-card');

            gameCards.forEach(card => {
                const title = card.querySelector('.game-title')?.textContent.toLowerCase() || '';
                const category = card.querySelector('.game-category')?.textContent.toLowerCase() || '';

                if (title.includes(searchTerm) || category.includes(searchTerm)) {
                    card.style.display = 'block';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(30px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });

            // Reset sidebar when searching
            if (searchTerm.length > 0) {
                document.querySelectorAll('.category-item').forEach(item =>
                    item.classList.remove('active')
                );
            } else {
                const allItem = document.querySelector('[data-category="all"]');
                if (allItem) {
                    allItem.classList.add('active');
                }
            }
        }, 300));
    }
}

// Keyboard Listeners
function setupKeyboardListeners() {
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            const searchBox = document.querySelector('.search-box');

            // Clear search if focused
            if (searchBox && searchBox === document.activeElement) {
                searchBox.value = '';
                searchBox.dispatchEvent(new Event('input'));
                searchBox.blur();
                return;
            }

            // Close modals
            closeAllModals();
        }
    });
}

// Modal Click Outside
function setupModalListeners() {
    // Profile modal
    const profileModal = document.getElementById('profileModal');
    if (profileModal) {
        profileModal.addEventListener('click', function (e) {
            if (e.target === profileModal) {
                closeProfile();
            }
        });
    }

    // Auth modals
    document.querySelectorAll('.auth-modal').forEach(modal => {
        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                closeAuth();
            }
        });
    });
}

// Game Card Listeners
function setupGameListeners() {
    document.querySelectorAll('.game-card').forEach(card => {
        card.addEventListener('click', function () {
            const gameTitle = this.querySelector('.game-title')?.textContent || 'Jogo';

            if (isLoggedIn) {
                alert(`Carregando ${gameTitle}... 🎮`);
            } else {
                alert('Faça login para jogar! 🎮');
                openLogin();
            }
        });
    });
}

// Scroll Effects
function setupScrollEffects() {
    window.addEventListener('scroll', function () {
        const header = document.querySelector('header');
        if (header) {
            if (window.scrollY > 100) {
                header.style.background = 'rgba(26, 26, 46, 0.95)';
            } else {
                header.style.background = 'rgba(26, 26, 46, 0.9)';
            }
        }
    });
}

// Handle Window Resize
function handleResize() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    const isMobile = window.innerWidth <= 768;

    if (!isMobile) {
        sidebar.classList.remove('active');
        sidebar.classList.remove('hidden');
    } else {
        sidebar.classList.remove('active');
    }
}

// Initialize Scroll Animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
}

// Debounce Function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize Demo Users
function initializeDemoUsers() {
    if (users.length === 0) {
        const demoUsers = [
            {
                id: 1,
                firstName: 'João',
                lastName: 'Silva',
                username: 'joao_gamer',
                email: 'joao@exemplo.com',
                password: '123456',
                birthDate: '1995-05-15',
                newsletter: true,
                createdAt: '2024-01-01T00:00:00.000Z',
                level: 25,
                gamesPlayed: 89,
                totalTime: '156h',
                achievements: ['first_game', 'marathon_gamer'],
                favorites: [],
                recentGames: []
            },
            {
                id: 2,
                firstName: 'Maria',
                lastName: 'Santos',
                username: 'maria_player',
                email: 'maria@exemplo.com',
                password: 'senha123',
                birthDate: '1992-08-22',
                newsletter: false,
                createdAt: '2024-01-15T00:00:00.000Z',
                level: 18,
                gamesPlayed: 67,
                totalTime: '89h',
                achievements: ['first_game'],
                favorites: [],
                recentGames: []
            }
        ];

        users = demoUsers;
        localStorage.setItem('pixelhive_users', JSON.stringify(users));
    }
}

// Social Functions (placeholders)
function loginWith(provider) {
    alert(`Login com ${provider} seria implementado aqui com API real.`);
}

function registerWith(provider) {
    alert(`Cadastro com ${provider} seria implementado aqui com API real.`);
}

function showTerms() {
    alert('Termos de Uso do PixelHive\n\n1. Use responsavelmente\n2. Respeite outros jogadores\n3. Divirta-se! 🎮');
}

function showPrivacy() {
    alert('Política de Privacidade\n\n- Dados armazenados localmente\n- Não compartilhamos com terceiros\n- Você controla seus dados');
}
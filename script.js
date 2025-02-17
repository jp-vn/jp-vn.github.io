let commandMode = false;
let commandInput = '';

document.addEventListener('keydown', function(event) {
    // Handle Space + ee for file tree
    if (event.code === 'KeyE' && event.shiftKey && commandMode) {
        event.preventDefault();
        document.getElementById('file-tree').classList.toggle('hidden');
        commandMode = false;
        commandInput = '';
    }

    // Enter command mode with ':'
    if (event.key === ':') {
        event.preventDefault();
        commandMode = true;
        commandInput = ':';
    }

    // Handle commands in command mode
    if (commandMode) {
        if (event.key === 'Enter') {
            handleCommand(commandInput);
            commandMode = false;
            commandInput = '';
        } else if (event.key === 'Escape') {
            commandMode = false;
            commandInput = '';
        } else if (event.key.length === 1) {
            commandInput += event.key;
        }
    }
});

function handleCommand(cmd) {
    switch(cmd.toLowerCase()) {
        case ':q':
            window.close();
            break;
        case ':h':
            document.getElementById('help-screen').classList.toggle('hidden');
            break;
        case ':w':
            alert('Not modifiable');
            break;
        case ':n':
            document.getElementById('editor').classList.toggle('hidden');
            break;
    }
}

// Add click handlers for menu items
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function() {
        const label = this.querySelector('.label').textContent;
        switch(label) {
            case 'New File':
                document.getElementById('editor').classList.toggle('hidden');
                break;
            case 'Toggle file explorer':
                document.getElementById('file-tree').classList.toggle('hidden');
                break;
            case 'Quit NVIM':
                window.close();
                break;
        }
    });
});

// Tab functionality
document.addEventListener('DOMContentLoaded', () => {
    const tabBar = document.getElementById('tab-bar');
    
    // Handle tab close button clicks
    tabBar.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-close')) {
            const tab = e.target.closest('.tab');
            if (tab) {
                tab.remove();
                // If there are no tabs left, you might want to show a default view
                if (tabBar.children.length === 0) {
                    const newTab = createTab('New File');
                    tabBar.appendChild(newTab);
                }
            }
        }
    });

    // Function to create a new tab
    function createTab(name) {
        const tab = document.createElement('div');
        tab.className = 'tab';
        tab.innerHTML = `
            <span class="tab-name">${name}</span>
            <button class="tab-close">×</button>
        `;
        return tab;
    }
});

// File Tree Functionality
document.addEventListener('DOMContentLoaded', () => {
    const fileTree = document.getElementById('file-tree');
    const editor = document.getElementById('editor');
    const dashboard = document.getElementById('alpha-dashboard');
    
    // Add click event listeners to all file items
    document.querySelectorAll('.file-item').forEach(item => {
        item.addEventListener('click', () => {
            const action = item.querySelector('.text').textContent;
            
            switch(action) {
                case 'New File':
                    dashboard.classList.add('hidden');
                    editor.classList.remove('hidden');
                    document.querySelector('.tab-name').textContent = '[No Name]';
                    break;
                    
                case 'Open Folder':
                    // You would typically open a folder dialog here
                    console.log('Open folder clicked');
                    break;
                    
                case 'Find File':
                    // You would typically open a file search dialog here
                    console.log('Find file clicked');
                    break;
                    
                case 'Recent Files':
                    // You would typically show recent files here
                    console.log('Recent files clicked');
                    break;
                    
                case 'Git':
                    // You would typically show git status here
                    console.log('Git clicked');
                    break;
                    
                case 'Close':
                    fileTree.classList.add('hidden');
                    dashboard.classList.remove('hidden');
                    break;
            }
            
            // Hide the file tree after action (except for Close which already handles this)
            if (action !== 'Close') {
                fileTree.classList.add('hidden');
            }
        });
    });
});

// Entry screen typing animation
function typeText(text, element, speed = 100) {
    return new Promise(resolve => {
        let i = 0;
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                resolve();
            }
        }
        type();
    });
}

function waitForEnter() {
    return new Promise(resolve => {
        function handleEnter(event) {
            if (event.key === 'Enter') {
                document.removeEventListener('keydown', handleEnter);
                resolve();
            }
        }
        
        document.addEventListener('keydown', handleEnter);
        
        const enterButton = document.querySelector('.terminal-enter');
        if (enterButton) {
            enterButton.addEventListener('click', () => {
                document.removeEventListener('keydown', handleEnter);
                resolve();
            }, { once: true });
        }
    });
}

async function handleEntryScreen() {
    const entryScreen = document.getElementById('entry-screen');
    const mainContent = document.getElementById('neovim-config');
    const typingElement = document.querySelector('.typing-text');

    // Type 'nvim' command faster
    await typeText('nvim', typingElement, 120);
    
    // Wait for enter key or button click
    await waitForEnter();
    
    // Hide entry screen and show main content
    entryScreen.style.opacity = '0';
    mainContent.classList.remove('hidden');
    
    // Fade out entry screen
    await new Promise(resolve => setTimeout(resolve, 500));
    entryScreen.style.display = 'none';
}

// Start the entry animation when the page loads
document.addEventListener('DOMContentLoaded', () => {
    handleEntryScreen();

    // Handle traffic light buttons
    function setupTrafficLights() {
        // Close buttons
        document.querySelectorAll('.close-button').forEach(button => {
            button.addEventListener('click', () => {
                const container = button.closest('#entry-screen, #neovim-config');
                if (container) {
                    container.style.display = 'none';
                    // Show message in the container's place
                    const message = document.createElement('div');
                    message.style.cssText = 'display:flex;justify-content:center;align-items:center;height:100vh;background:#1a1b26;color:#a9b1d6;font-family:monospace;';
                    message.textContent = 'Terminal closed, please refresh the page.';
                    document.body.appendChild(message);
                }
            });
        });

        // Fullscreen buttons
        document.querySelectorAll('.fullscreen-button').forEach(button => {
            button.addEventListener('click', () => {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(err => {
                        console.log(`Error attempting to enable fullscreen: ${err.message}`);
                    });
                } else {
                    document.exitFullscreen().catch(err => {
                        console.log(`Error attempting to exit fullscreen: ${err.message}`);
                    });
                }
            });
        });
    }

    // Initial setup of traffic lights
    setupTrafficLights();

    // Re-setup traffic lights after the main interface is shown
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && 
                mutation.attributeName === 'class' &&
                !document.getElementById('neovim-config').classList.contains('hidden')) {
                setupTrafficLights();
            }
        });
    });

    observer.observe(document.getElementById('neovim-config'), {
        attributes: true
    });
});

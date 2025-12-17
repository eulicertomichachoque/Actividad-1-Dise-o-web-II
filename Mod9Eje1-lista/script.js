// ============ MÓDULO: ESTADO Y DATOS ============
const ListManager = (() => {
    let items = [];
    let nextId = 1;
    
    // Cargar desde localStorage
    const loadFromStorage = () => {
        try {
            const saved = localStorage.getItem('listManagerItems');
            if (saved) {
                items = JSON.parse(saved);
                nextId = items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
            }
        } catch (error) {
            console.error('Error cargando datos:', error);
            items = [];
            nextId = 1;
        }
    };
    
    // Guardar en localStorage
    const saveToStorage = () => {
        try {
            localStorage.setItem('listManagerItems', JSON.stringify(items));
        } catch (error) {
            console.error('Error guardando datos:', error);
        }
    };
    
    return {
        initialize: () => {
            loadFromStorage();
            return items;
        },
        
        addItem: (text) => {
            const newItem = {
                id: nextId++,
                text: text.trim(),
                completed: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            items.push(newItem);
            saveToStorage();
            return newItem;
        },
        
        updateItem: (id, updates) => {
            const index = items.findIndex(item => item.id === id);
            if (index !== -1) {
                items[index] = {
                    ...items[index],
                    ...updates,
                    updatedAt: new Date().toISOString()
                };
                saveToStorage();
                return items[index];
            }
            return null;
        },
        
        deleteItem: (id) => {
            const index = items.findIndex(item => item.id === id);
            if (index !== -1) {
                const deleted = items.splice(index, 1)[0];
                saveToStorage();
                return deleted;
            }
            return null;
        },
        
        deleteAllItems: () => {
            const deletedCount = items.length;
            items = [];
            nextId = 1;
            localStorage.removeItem('listManagerItems');
            return deletedCount;
        },
        
        toggleComplete: (id) => {
            const item = items.find(item => item.id === id);
            if (item) {
                item.completed = !item.completed;
                item.updatedAt = new Date().toISOString();
                saveToStorage();
                return item;
            }
            return null;
        },
        
        getItems: () => [...items],
        
        getItemCount: () => items.length,
        
        getCompletedCount: () => items.filter(item => item.completed).length,
        
        sortItems: (order = 'asc') => {
            const sorted = [...items].sort((a, b) => {
                if (order === 'asc') {
                    return a.text.localeCompare(b.text);
                } else {
                    return b.text.localeCompare(a.text);
                }
            });
            items = sorted;
            saveToStorage();
            return items;
        }
    };
})();

// ============ MÓDULO: INTERFAZ DE USUARIO ============
const UI = (() => {
    // Elementos del DOM
    const elements = {
        itemInput: document.getElementById('itemInput'),
        addBtn: document.getElementById('addBtn'),
        clearInputBtn: document.getElementById('clearInputBtn'),
        itemList: document.getElementById('itemList'),
        emptyState: document.getElementById('emptyState'),
        itemCount: document.getElementById('itemCount'),
        charCount: document.getElementById('charCount'),
        lastAction: document.getElementById('lastAction'),
        listStatus: document.getElementById('listStatus'),
        listCounter: document.getElementById('listCounter'),
        clearAllBtn: document.getElementById('clearAllBtn'),
        exportBtn: document.getElementById('exportBtn'),
        sortBtn: document.getElementById('sortBtn'),
        actionFeedback: document.getElementById('actionFeedback'),
        editDialog: document.getElementById('editDialog'),
        editInput: document.getElementById('editInput'),
        saveEditBtn: document.getElementById('saveEditBtn'),
        cancelEditBtn: document.getElementById('cancelEditBtn')
    };
    
    // Estado de edición
    let currentEditId = null;
    
    // Formatear fecha
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    
    // Mostrar feedback
    const showFeedback = (message, type = 'info') => {
        const feedback = elements.actionFeedback;
        feedback.textContent = message;
        feedback.className = `feedback-message ${type}`;
        
        // Auto-ocultar después de 3 segundos
        setTimeout(() => {
            if (feedback.textContent === message) {
                feedback.textContent = '';
                feedback.className = 'feedback-message';
            }
        }, 3000);
    };
    
    // Actualizar estadísticas
    const updateStats = () => {
        const total = ListManager.getItemCount();
        const completed = ListManager.getCompletedCount();
        
        elements.itemCount.textContent = total;
        elements.charCount.textContent = 100 - (elements.itemInput.value.length || 0);
        
        if (total === 0) {
            elements.listStatus.textContent = 'No hay items en la lista';
            elements.listCounter.textContent = 'La lista contiene 0 items';
        } else {
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
            elements.listStatus.textContent = `${completed}/${total} completados (${progress}%)`;
            elements.listCounter.textContent = `La lista contiene ${total} items, ${completed} completados`;
        }
    };
    
    // Crear elemento de lista
    const createListItemElement = (item) => {
        const li = document.createElement('li');
        li.className = `item-list-item ${item.completed ? 'completed' : ''}`;
        li.dataset.id = item.id;
        
        const timeAgo = formatDate(item.createdAt);
        
        li.innerHTML = `
            <div class="item-content">
                <span class="item-text">${item.text}</span>
                <div class="item-meta">
                    <span class="item-time" title="Creado: ${new Date(item.createdAt).toLocaleString()}">
                        🕒 ${timeAgo}
                    </span>
                    ${item.completed ? '<span class="item-completed">✅ Completado</span>' : ''}
                </div>
            </div>
            <div class="item-buttons">
                <button class="btn-icon btn-complete" 
                        aria-label="${item.completed ? 'Marcar como pendiente' : 'Marcar como completado'}">
                    ${item.completed ? '↩️' : '✓'}
                </button>
                <button class="btn-icon btn-edit" aria-label="Editar item">
                    ✏️
                </button>
                <button class="btn-icon btn-delete" aria-label="Eliminar item">
                    🗑️
                </button>
            </div>
        `;
        
        return li;
    };
    
    // Renderizar lista
    const renderList = () => {
        const items = ListManager.getItems();
        const fragment = document.createDocumentFragment();
        
        // Mostrar/ocultar estado vacío
        if (items.length === 0) {
            elements.emptyState.classList.remove('hidden');
        } else {
            elements.emptyState.classList.add('hidden');
        }
        
        // Limpiar lista (pero mantener el empty state)
        const listItems = elements.itemList.querySelectorAll('.item-list-item');
        listItems.forEach(item => item.remove());
        
        // Añadir items
        items.forEach(item => {
            fragment.appendChild(createListItemElement(item));
        });
        
        elements.itemList.appendChild(fragment);
        updateStats();
    };
    
    // Mostrar diálogo de edición
    const showEditDialog = (item) => {
        currentEditId = item.id;
        elements.editInput.value = item.text;
        elements.editDialog.showModal();
        elements.editInput.focus();
        elements.editInput.select();
    };
    
    // Ocultar diálogo de edición
    const hideEditDialog = () => {
        currentEditId = null;
        elements.editInput.value = '';
        elements.editDialog.close();
    };
    
    // Exportar lista
    const exportList = () => {
        const items = ListManager.getItems();
        const text = items.map((item, index) => 
            `${index + 1}. ${item.text} ${item.completed ? '[✓]' : ''}`
        ).join('\n');
        
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `lista_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showFeedback('Lista exportada correctamente', 'success');
    };
    
    return {
        initialize: () => {
            // Verificar que todos los elementos existen
            Object.keys(elements).forEach(key => {
                if (!elements[key]) {
                    console.warn(`Elemento no encontrado: ${key}`);
                }
            });
            
            // Renderizar lista inicial
            renderList();
        },
        
        getElements: () => elements,
        
        renderList,
        
        updateStats,
        
        showFeedback,
        
        showEditDialog,
        
        hideEditDialog,
        
        getCurrentEditId: () => currentEditId,
        
        clearInput: () => {
            elements.itemInput.value = '';
            elements.itemInput.focus();
            updateStats();
        },
        
        exportList,
        
        setLastAction: (action) => {
            elements.lastAction.textContent = action;
        }
    };
})();

// ============ MÓDULO: MANEJADORES DE EVENTOS ============
const EventHandlers = (() => {
    const elements = UI.getElements();
    
    // Añadir item
    const handleAddItem = () => {
        const text = elements.itemInput.value.trim();
        
        if (!text) {
            UI.showFeedback('Por favor escribe algo antes de añadir', 'error');
            elements.itemInput.focus();
            return;
        }
        
        if (text.length > 100) {
            UI.showFeedback('El texto no puede exceder 100 caracteres', 'error');
            return;
        }
        
        const newItem = ListManager.addItem(text);
        UI.renderList();
        UI.clearInput();
        UI.showFeedback(`"${newItem.text}" añadido a la lista`, 'success');
        UI.setLastAction('Añadir');
    };
    
    // Eliminar item
    const handleDeleteItem = (itemId) => {
        const deletedItem = ListManager.deleteItem(itemId);
        if (deletedItem) {
            UI.renderList();
            UI.showFeedback(`"${deletedItem.text}" eliminado`, 'success');
            UI.setLastAction('Eliminar');
        }
    };
    
    // Toggle completado
    const handleToggleComplete = (itemId) => {
        const toggledItem = ListManager.toggleComplete(itemId);
        if (toggledItem) {
            UI.renderList();
            const action = toggledItem.completed ? 'completado' : 'pendiente';
            UI.showFeedback(`Item marcado como ${action}`, 'success');
            UI.setLastAction('Completar');
        }
    };
    
    // Iniciar edición
    const handleStartEdit = (itemId) => {
        const items = ListManager.getItems();
        const item = items.find(item => item.id === itemId);
        if (item) {
            UI.showEditDialog(item);
        }
    };
    
    // Guardar edición
    const handleSaveEdit = () => {
        const itemId = UI.getCurrentEditId();
        const newText = elements.editInput.value.trim();
        
        if (!newText) {
            UI.showFeedback('El texto no puede estar vacío', 'error');
            return;
        }
        
        if (newText.length > 100) {
            UI.showFeedback('El texto no puede exceder 100 caracteres', 'error');
            return;
        }
        
        const updatedItem = ListManager.updateItem(itemId, { text: newText });
        if (updatedItem) {
            UI.renderList();
            UI.hideEditDialog();
            UI.showFeedback('Item actualizado correctamente', 'success');
            UI.setLastAction('Editar');
        }
    };
    
    // Limpiar todo
    const handleClearAll = () => {
        const count = ListManager.getItemCount();
        
        if (count === 0) {
            UI.showFeedback('La lista ya está vacía', 'info');
            return;
        }
        
        // Crear diálogo de confirmación personalizado
        const confirmed = window.confirm(`¿Estás seguro de eliminar todos los ${count} items? Esta acción no se puede deshacer.`);
        
        if (confirmed) {
            const deletedCount = ListManager.deleteAllItems();
            UI.renderList();
            UI.showFeedback(`${deletedCount} items eliminados`, 'success');
            UI.setLastAction('Limpiar todo');
        }
    };
    
    // Ordenar items
    const handleSortItems = () => {
        let currentOrder = 'asc';
        ListManager.sortItems(currentOrder);
        UI.renderList();
        UI.showFeedback('Lista ordenada alfabéticamente', 'success');
        UI.setLastAction('Ordenar');
    };
    
    return {
        handleAddItem,
        handleDeleteItem,
        handleToggleComplete,
        handleStartEdit,
        handleSaveEdit,
        handleClearAll,
        handleSortItems
    };
})();

// ============ INICIALIZACIÓN ============
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar estado
    ListManager.initialize();
    UI.initialize();
    
    const elements = UI.getElements();
    const handlers = EventHandlers;
    
    // ============ CONFIGURACIÓN DE EVENTOS ============
    
    // Añadir item
    elements.addBtn?.addEventListener('click', handlers.handleAddItem);
    
    elements.itemInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handlers.handleAddItem();
        }
    });
    
    // Limpiar input
    elements.clearInputBtn?.addEventListener('click', () => {
        UI.clearInput();
        UI.showFeedback('Campo limpiado', 'info');
    });
    
    // Delegación de eventos para la lista
    elements.itemList?.addEventListener('click', (e) => {
        const listItem = e.target.closest('.item-list-item');
        if (!listItem) return;
        
        const itemId = parseInt(listItem.dataset.id);
        
        if (e.target.classList.contains('btn-delete')) {
            handlers.handleDeleteItem(itemId);
        } else if (e.target.classList.contains('btn-edit')) {
            handlers.handleStartEdit(itemId);
        } else if (e.target.classList.contains('btn-complete')) {
            handlers.handleToggleComplete(itemId);
        } else if (listItem.contains(e.target)) {
            // Click en el item para toggle rápido
            if (!e.target.closest('.item-buttons')) {
                handlers.handleToggleComplete(itemId);
            }
        }
    });
    
    // Diálogo de edición
    elements.saveEditBtn?.addEventListener('click', handlers.handleSaveEdit);
    
    elements.cancelEditBtn?.addEventListener('click', () => {
        UI.hideEditDialog();
        UI.showFeedback('Edición cancelada', 'info');
    });
    
    elements.editDialog?.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            UI.hideEditDialog();
            UI.showFeedback('Edición cancelada', 'info');
        } else if (e.key === 'Enter' && e.ctrlKey) {
            handlers.handleSaveEdit();
        }
    });
    
    elements.editInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handlers.handleSaveEdit();
        }
    });
    
    // Acciones principales
    elements.clearAllBtn?.addEventListener('click', handlers.handleClearAll);
    
    elements.exportBtn?.addEventListener('click', UI.exportList);
    
    elements.sortBtn?.addEventListener('click', handlers.handleSortItems);
    
    // Contador de caracteres en tiempo real
    elements.itemInput?.addEventListener('input', () => {
        UI.updateStats();
        
        // Validación visual
        const length = elements.itemInput.value.length;
        if (length > 95) {
            elements.charCount.classList.add('pulse');
        } else {
            elements.charCount.classList.remove('pulse');
        }
    });
    
    // ============ ATRIBUTOS Y ACCESIBILIDAD ============
    
    // Tooltips nativos
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        const label = button.getAttribute('aria-label');
        if (label && !button.getAttribute('title')) {
            button.setAttribute('title', label);
        }
    });
    
    // Focus management para el diálogo
    elements.editDialog?.addEventListener('close', () => {
        const editButton = document.querySelector('.btn-edit[aria-label="Editar item"]');
        if (editButton) {
            editButton.focus();
        }
    });
    
    // ============ EJEMPLOS INICIALES (OPCIONAL) ============
    const addExampleItems = () => {
        if (ListManager.getItemCount() === 0) {
            const examples = [
                'Aprender JavaScript moderno',
                'Practicar manipulación del DOM',
                'Crear aplicaciones interactivas',
                'Implementar buenas prácticas',
                'Documentar el código'
            ];
            
            examples.forEach(text => {
                ListManager.addItem(text);
            });
            
            UI.renderList();
            UI.showFeedback('Items de ejemplo cargados', 'info');
        }
    };
    
    // Descomentar la siguiente línea para añadir ejemplos automáticamente
    // addExampleItems();
    
    // ============ SERVICE WORKER (OPCIONAL) ============
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').catch(error => {
                console.log('Service Worker registration failed:', error);
            });
        });
    }
});

// ============ EXPORTACIÓN PARA MÓDULOS ============
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ListManager,
        UI,
        EventHandlers
    };
}

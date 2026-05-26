document.addEventListener('DOMContentLoaded', () => {
    // ===== ГЛОБАЛЬНЫЕ ФУНКЦИИ =====
    function getData() {
        const data = localStorage.getItem('habitTrackerData');
        return data ? JSON.parse(data) : {
            habits: [
                { id: 1, name: 'Утренняя йога', schedule: '15 минут/ Ежедневно', category: 'Спорт', icon: '🧘', color: '#6c5ce7', completed: false, dates: [], streak: 0 },
                { id: 2, name: 'Выпить 2л воды', schedule: 'В течении дня', category: 'Здоровье', icon: '💧', color: '#00cec9', completed: false, dates: [], streak: 0 },
                { id: 3, name: 'Чтение книг', schedule: '30 минут/ Ежедневно', category: 'Обучение', icon: '📚', color: '#fdcb6e', completed: false, dates: [], streak: 0 },
                { id: 4, name: 'Пробежка', schedule: '3 км/ 3 раза в неделю', category: 'Спорт', icon: '🏃', color: '#e17055', completed: false, dates: [], streak: 0 }
            ],
            user: { name: 'Пользователь', email: 'почта@gmail.com' }
        };
    }

    function saveData(data) {
        localStorage.setItem('habitTrackerData', JSON.stringify(data));
    }

    function getToday() {
        return new Date().toISOString().split('T')[0];
    }

    // ===== ПОДСТАВКА ИМЕНИ ПОЛЬЗОВАТЕЛЯ =====
    const data = getData();
    const nameElements = document.querySelectorAll('.name, .greeting h1');
    nameElements.forEach(el => {
        if (el.classList.contains('greeting')) {
            el.innerHTML = `Привет, ${data.user.name}!`;
        } else if (el.classList.contains('name')) {
            el.textContent = data.user.name;
        }
    });

    // ===== ОТРИСОВКА ПРИВЫЧЕК =====
    const habitList = document.querySelector('.habits-section');
    const showAllBtn = document.querySelector('.show-all-btn');
    let showAll = false;

    function renderHabits() {
        const habits = data.habits;
        const today = getToday();
        
        // Очищаем существующий список (кроме заголовка)
        const header = habitList.querySelector('.habits-header');
        habitList.innerHTML = '';
        habitList.appendChild(header);

        // Показываем 4 или все привычки
        const habitsToShow = showAll ? habits : habits.slice(0, 4);

        habitsToShow.forEach(habit => {
            const isCompleted = habit.dates.includes(today);
            const habitEl = document.createElement('div');
            habitEl.className = 'habit-item';
            habitEl.innerHTML = `
                <div class="habit-checkbox" style="background: ${isCompleted ? habit.color : 'transparent'}; border-color: ${isCompleted ? habit.color : '#ddd'};"></div>
                <div class="habit-info">
                    <div class="habit-name">${habit.icon} ${habit.name}</div>
                    <div class="habit-schedule">${habit.schedule}</div>
                </div>
                <div class="habit-tags">
                    <span class="habit-tag">${habit.category}</span>
                    <span class="habit-fire"><span class="flame">🔥</span><span class="count">${habit.streak}</span></span>
                </div>
            `;

            // Клик по чекбоксу
            const checkbox = habitEl.querySelector('.habit-checkbox');
            checkbox.addEventListener('click', () => toggleHabit(habit.id));
            
            habitList.appendChild(habitEl);
        });

        updateStats();
    }

    // ===== ПЕРЕКЛЮЧЕНИЕ ПРИВЫЧКИ =====
    function toggleHabit(id) {
        const habit = data.habits.find(h => h.id === id);
        if (habit) {
            const today = getToday();
            const index = habit.dates.indexOf(today);
            
            if (index > -1) {
                // Убираем отметку
                habit.dates.splice(index, 1);
                habit.streak = calculateStreak(habit.dates);
                showNotification('Привычка отменена', 'error');
            } else {
                // Добавляем отметку
                habit.dates.push(today);
                habit.streak = calculateStreak(habit.dates);
                showNotification('Отлично! Привычка выполнена! 🎉', 'success');
            }
            
            saveData(data);
            renderHabits();
        }
    }

    // ===== РАСЧЁТ СЕРИИ =====
    function calculateStreak(dates) {
        if (!dates.length) return 0;
        let streak = 0;
        const sorted = [...dates].sort().reverse();
        const today = new Date();
        
        for (let i = 0; i < sorted.length; i++) {
            const checkDate = new Date();
            checkDate.setDate(today.getDate() - i);
            const dateStr = checkDate.toISOString().split('T')[0];
            if (sorted.includes(dateStr)) {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    }

    // ===== ОБНОВЛЕНИЕ СТАТИСТИКИ =====
    function updateStats() {
        const today = getToday();
        const habits = data.habits;
        
        // Прогресс сегодня
        const completedToday = habits.filter(h => h.dates.includes(today)).length;
        const totalHabits = habits.length;
        const progressPercent = totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0;
        
        const progressValue = document.querySelector('.stat-card .stat-value');
        const progressBar = document.querySelector('.progress-bar .fill.purple');
        if (progressValue) progressValue.textContent = `${completedToday}/${totalHabits}`;
        if (progressBar) progressBar.style.width = `${progressPercent}%`;

        // Текущая серия (максимальная)
        const maxStreak = Math.max(...habits.map(h => h.streak), 0);
        const streakValue = document.querySelectorAll('.stat-value')[1];
        const streakBar = document.querySelector('.progress-bar .fill.orange');
        if (streakValue) streakValue.textContent = `${maxStreak} дней`;
        if (streakBar) streakBar.style.width = `${Math.min(maxStreak * 10, 100)}%`;

        // Всего выполнено
        const totalCompleted = habits.reduce((sum, h) => sum + h.dates.length, 0);
        const totalValue = document.querySelectorAll('.stat-value')[2];
        const totalBar = document.querySelector('.progress-bar .fill.green');
        if (totalValue) totalValue.textContent = totalCompleted;
        if (totalBar) totalBar.style.width = `${Math.min((totalCompleted / 100) * 100, 100)}%`;
    }

    // ===== КНОПКА "ПОКАЗАТЬ ВСЕ" =====
    if (showAllBtn) {
        showAllBtn.addEventListener('click', () => {
            showAll = !showAll;
            showAllBtn.textContent = showAll ? 'Скрыть' : 'Показать все';
            renderHabits();
        });
    }

    // ===== УВЕДОМЛЕНИЯ =====
    function showNotification(message, type = 'success') {
        const notif = document.createElement('div');
        notif.textContent = message;
        notif.style.cssText = `
            position: fixed; bottom: 20px; right: 20px; padding: 14px 20px;
            background: ${type === 'success' ? '#00b894' : '#d63031'};
            color: white; border-radius: 12px; z-index: 10000;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2); animation: slideIn 0.3s;
        `;
        document.body.appendChild(notif);
        setTimeout(() => {
            notif.style.animation = 'slideOut 0.3s forwards';
            setTimeout(() => notif.remove(), 300);
        }, 2500);
    }

    // Добавляем стили для анимации
    if (!document.getElementById('notif-styles')) {
        const style = document.createElement('style');
        style.id = 'notif-styles';
        style.textContent = `
            @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
        `;
        document.head.appendChild(style);
    }

    // ===== ИНИЦИАЛИЗАЦИЯ =====
    renderHabits();
});

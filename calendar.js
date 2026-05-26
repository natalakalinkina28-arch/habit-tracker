document.addEventListener('DOMContentLoaded', () => {
    function getData() {
        const data = localStorage.getItem('habitTrackerData');
        return data ? JSON.parse(data) : {
            habits: [],
            user: { name: 'Пользователь', email: 'почта@gmail.com' }
        };
    }

    function saveData(data) {
        localStorage.setItem('habitTrackerData', JSON.stringify(data));
    }

    // Элементы
    const calendarGrid = document.querySelector('.calendar');
    const monthDisplay = document.querySelector('.current-month');
    const prevBtn = document.querySelector('.prev-month');
    const nextBtn = document.querySelector('.next-month');

    let currentDate = new Date();
    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
                        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

    function renderCalendar() {
        // Очищаем календарь (оставляем только дни недели)
        const weekdays = Array.from(calendarGrid.querySelectorAll('.weekday'));
        calendarGrid.innerHTML = '';
        weekdays.forEach(day => calendarGrid.appendChild(day));

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        if (monthDisplay) {
            monthDisplay.textContent = `${monthNames[month]} ${year}`;
        }

        const firstDay = new Date(year, month, 1).getDay(); // 0 = Вс, 1 = Пн
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Корректировка для начала с понедельника
        const startOffset = firstDay === 0 ? 6 : firstDay - 1;

        const data = getData();

        // Пустые ячейки
        for (let i = 0; i < startOffset; i++) {
            const empty = document.createElement('div');
            empty.className = 'day empty';
            calendarGrid.appendChild(empty);
        }

        // Дни месяца
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            
            // Считаем выполненные привычки
            let completedCount = 0;
            data.habits.forEach(habit => {
                if (habit.dates?.includes(dateStr)) completedCount++;
            });

            const totalHabits = data.habits.length;
            let bgColor = '#f0f0f0'; // серый
            let textColor = '#333';

            if (totalHabits > 0) {
                if (completedCount === totalHabits) {
                    bgColor = '#90EE90'; // зелёный
                } else if (completedCount > 0) {
                    bgColor = '#f0e86f'; // жёлтый
                }
            }

            const dayEl = document.createElement('div');
            dayEl.className = 'day';
            dayEl.textContent = day;
            dayEl.style.backgroundColor = bgColor;
            dayEl.style.color = textColor;

            // Клик по дню
            dayEl.addEventListener('click', () => {
                const habitsForDay = data.habits.filter(h => h.dates?.includes(dateStr));
                const details = habitsForDay.map(h => `• ${h.name}`).join('\n') || 'Нет выполненных привычек';
                alert(`📅 ${dateStr}\n\nВыполнено: ${completedCount} из ${totalHabits}\n\n${details}`);
            });

            calendarGrid.appendChild(dayEl);
        }
    }

    // Навигация
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });
    }

    // Инициализация
    renderCalendar();
});

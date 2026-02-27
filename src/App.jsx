import { useState } from "react";
import menuData from "./menu.json";
import "./App.css";

// ─── Вспомогательная функция: уникальные категории из данных ───────────────
function getCategories(items) {
  const cats = items.map((item) => item.category);
  return ["Все", ...new Set(cats)];
}

// ─── Компонент: карточка блюда в списке ───────────────────────────────────
function MenuCard({ item, onClick }) {
  return (
    <div className="menu-card" onClick={() => onClick(item)}>
      <img src={item.photo} alt={item.name} className="menu-card__img" />
      <div className="menu-card__body">
        <h3 className="menu-card__name">{item.name}</h3>
        <span className="menu-card__category">{item.category}</span>
        <div className="menu-card__footer">
          <span className="menu-card__weight">{item.weight}</span>
          <span className="menu-card__price">{item.price} ₽</span>
        </div>
      </div>
    </div>
  );
}

// ─── Компонент: модальное окно с деталями блюда ───────────────────────────
function DishModal({ item, onClose }) {
  // Закрытие по клику на тёмный фон
  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal">
        <button className="modal__close" onClick={onClose}>✕</button>
        <img src={item.photo} alt={item.name} className="modal__img" />
        <div className="modal__body">
          <h2 className="modal__name">{item.name}</h2>
          <span className="modal__category">{item.category}</span>
          <p className="modal__description">{item.description}</p>
          <div className="modal__footer">
            <span className="modal__weight">{item.weight}</span>
            <span className="modal__price">{item.price} ₽</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Компонент: форма бронирования столика ────────────────────────────────
function BookingForm() {
  // Начальное состояние формы
  const initialState = {
    name: "",
    phone: "",
    date: "",
    time: "",
    guests: 2,
    zone: "non-smoking", // "smoking" или "non-smoking"
  };

  const [form, setForm] = useState(initialState);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Обновляем нужное поле при изменении любого input
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    // Простая валидация: все поля обязательны
    if (!form.name || !form.phone || !form.date || !form.time) {
      setError("Пожалуйста, заполните все поля.");
      return;
    }

    setError("");
    setSubmitted(true);
  }

  function handleReset() {
    setForm(initialState);
    setSubmitted(false);
  }

  // Показываем подтверждение после успешной отправки
  if (submitted) {
    const zoneLabel = form.zone === "smoking" ? "для курящих" : "для некурящих";
    return (
      <div className="booking-success">
        <div className="booking-success__icon">✓</div>
        <h3>Столик забронирован!</h3>
        <p>
          <strong>{form.name}</strong>, ждём вас {form.date} в {form.time}.
        </p>
        <p>
          Гостей: <strong>{form.guests}</strong> · Зал{" "}
          <strong>{zoneLabel}</strong>
        </p>
        <button className="btn" onClick={handleReset}>
          Новое бронирование
        </button>
      </div>
    );
  }

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      {error && <p className="booking-form__error">{error}</p>}

      <div className="form-row">
        <label>Ваше имя</label>
        <input
          type="text"
          name="name"
          placeholder="Иван Иванов"
          value={form.name}
          onChange={handleChange}
        />
      </div>

      <div className="form-row">
        <label>Телефон</label>
        <input
          type="tel"
          name="phone"
          placeholder="+7 900 000-00-00"
          value={form.phone}
          onChange={handleChange}
        />
      </div>

      <div className="form-row form-row--half">
        <div>
          <label>Дата</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Время</label>
          <input
            type="time"
            name="time"
            value={form.time}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-row">
        <label>Количество гостей: <strong>{form.guests}</strong></label>
        {/* range-слайдер — наглядно для новичка */}
        <input
          type="range"
          name="guests"
          min="1"
          max="12"
          value={form.guests}
          onChange={handleChange}
          className="guests-slider"
        />
        <div className="guests-slider__labels">
          <span>1</span>
          <span>12</span>
        </div>
      </div>

      <div className="form-row">
        <label>Зал</label>
        <div className="zone-toggle">
          {/* Кнопки-переключатели вместо radio для наглядности */}
          <button
            type="button"
            className={`zone-btn ${form.zone === "non-smoking" ? "zone-btn--active" : ""}`}
            onClick={() => setForm((prev) => ({ ...prev, zone: "non-smoking" }))}
          >
            🚭 Для некурящих
          </button>
          <button
            type="button"
            className={`zone-btn ${form.zone === "smoking" ? "zone-btn--active" : ""}`}
            onClick={() => setForm((prev) => ({ ...prev, zone: "smoking" }))}
          >
            🚬 Для курящих
          </button>
        </div>
      </div>

      <button type="submit" className="btn btn--full">
        Забронировать столик
      </button>
    </form>
  );
}

// ─── Главный компонент приложения ─────────────────────────────────────────
export default function App() {
  // Активная категория фильтра
  const [activeCategory, setActiveCategory] = useState("Все");
  // Выбранное блюдо для модального окна (null = окно закрыто)
  const [selectedDish, setSelectedDish] = useState(null);
  // Активная вкладка: "menu" или "booking"
  const [tab, setTab] = useState("menu");

  const categories = getCategories(menuData);

  // Фильтруем блюда по выбранной категории
  const filteredMenu =
    activeCategory === "Все"
      ? menuData
      : menuData.filter((item) => item.category === activeCategory);

  return (
    <div className="app">
      {/* ── Шапка ── */}
      <header className="header">
        <div className="header__inner">
          <h1 className="header__logo">☕ Кафе «Уют»</h1>
          <nav className="header__nav">
            <button
              className={`nav-btn ${tab === "menu" ? "nav-btn--active" : ""}`}
              onClick={() => setTab("menu")}
            >
              Меню
            </button>
            <button
              className={`nav-btn ${tab === "booking" ? "nav-btn--active" : ""}`}
              onClick={() => setTab("booking")}
            >
              Бронирование
            </button>
          </nav>
        </div>
      </header>

      <main className="main">
        {/* ── Вкладка: Меню ── */}
        {tab === "menu" && (
          <section>
            {/* Фильтр по категориям */}
            <div className="filters">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`filter-btn ${activeCategory === cat ? "filter-btn--active" : ""}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Сетка карточек */}
            <div className="menu-grid">
              {filteredMenu.map((item) => (
                <MenuCard
                  key={item.id}
                  item={item}
                  onClick={setSelectedDish}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Вкладка: Бронирование ── */}
        {tab === "booking" && (
          <section className="booking-section">
            <h2 className="section-title">Забронировать столик</h2>
            <BookingForm />
          </section>
        )}
      </main>

      {/* ── Модальное окно блюда ── */}
      {selectedDish && (
        <DishModal item={selectedDish} onClose={() => setSelectedDish(null)} />
      )}
    </div>
  );
}

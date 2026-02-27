import { useState } from "react";
import menuData from "./menu.json";
import "./App.css";

// ─── Вспомогательная функция: уникальные категории из данных ───────────────
function getCategories(items) {
  const cats = items.map((item) => item.category);
  return ["Все", ...new Set(cats)];
}

// Пресеты модификаций, которые можно выбрать одним кликом
const MODIFICATION_PRESETS = [
  "без арахиса",
  "без орехов",
  "без глютена",
  "без лактозы",
  "без острого",
  "без лука",
  "без чеснока",
];

// ─── Компонент: карточка блюда в списке ───────────────────────────────────
function MenuCard({ item, onClick, onAddToCart }) {
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
        {/* Кнопка добавления в заказ — stopPropagation чтобы не открывать модалку */}
        <button
          className="menu-card__add-btn"
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(item);
          }}
        >
          + В заказ
        </button>
      </div>
    </div>
  );
}

// ─── Компонент: модальное окно с деталями блюда ───────────────────────────
function DishModal({ item, onClose, onAddToCart }) {
  // Выбранные пресеты (массив строк)
  const [selectedPresets, setSelectedPresets] = useState([]);
  // Своё пожелание, введённое вручную
  const [customNote, setCustomNote] = useState("");

  // Закрытие по клику на тёмный фон
  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  // Переключить пресет: если уже выбран — убрать, иначе добавить
  function togglePreset(preset) {
    setSelectedPresets((prev) =>
      prev.includes(preset) ? prev.filter((p) => p !== preset) : [...prev, preset]
    );
  }

  function handleAddToCart() {
    // Собираем все пожелания в одну строку
    const allNotes = [...selectedPresets, customNote.trim()]
      .filter(Boolean)
      .join(", ");
    onAddToCart(item, allNotes || null);
    onClose();
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

          {/* ── Калорийность и БЖУ ── */}
          <div className="nutrition">
            <div className="nutrition__item">
              <span className="nutrition__value">{item.calories}</span>
              <span className="nutrition__label">ккал</span>
            </div>
            <div className="nutrition__divider" />
            <div className="nutrition__item">
              <span className="nutrition__value">{item.proteins} г</span>
              <span className="nutrition__label">белки</span>
            </div>
            <div className="nutrition__item">
              <span className="nutrition__value">{item.fats} г</span>
              <span className="nutrition__label">жиры</span>
            </div>
            <div className="nutrition__item">
              <span className="nutrition__value">{item.carbs} г</span>
              <span className="nutrition__label">углеводы</span>
            </div>
          </div>

          {/* ── Модификации ── */}
          <div className="modifications">
            <p className="modifications__title">Пожелания к блюду:</p>
            <div className="modifications__presets">
              {MODIFICATION_PRESETS.map((preset) => (
                <button
                  key={preset}
                  className={`mod-tag ${selectedPresets.includes(preset) ? "mod-tag--active" : ""}`}
                  onClick={() => togglePreset(preset)}
                >
                  {preset}
                </button>
              ))}
            </div>
            <input
              type="text"
              className="modifications__input"
              placeholder="Вписать своё пожелание..."
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
            />
          </div>

          <div className="modal__footer">
            <div>
              <span className="modal__weight">{item.weight}</span>
            </div>
            <div className="modal__footer-right">
              <span className="modal__price">{item.price} ₽</span>
              <button className="btn" onClick={handleAddToCart}>
                + В заказ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Компонент: вкладка «Мой заказ» (корзина) ────────────────────────────
function OrderTab({ cart, onRemove, onClear }) {
  if (cart.length === 0) {
    return (
      <div className="order-empty">
        <div className="order-empty__icon">🛒</div>
        <p>Ваш заказ пуст</p>
        <p className="order-empty__hint">Добавьте блюда из меню</p>
      </div>
    );
  }

  // Считаем итоговую сумму
  const total = cart.reduce((sum, entry) => sum + entry.item.price, 0);

  return (
    <section className="order-section">
      <div className="order-header">
        <h2 className="section-title">Мой заказ</h2>
        <button className="btn-ghost" onClick={onClear}>Очистить</button>
      </div>

      <ul className="order-list">
        {cart.map((entry) => (
          <li key={entry.uid} className="order-item">
            <img src={entry.item.photo} alt={entry.item.name} className="order-item__img" />
            <div className="order-item__info">
              <span className="order-item__name">{entry.item.name}</span>
              {/* Показываем пожелания, если есть */}
              {entry.note && (
                <span className="order-item__note">✎ {entry.note}</span>
              )}
            </div>
            <span className="order-item__price">{entry.item.price} ₽</span>
            <button
              className="order-item__remove"
              onClick={() => onRemove(entry.uid)}
              title="Убрать из заказа"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <div className="order-total">
        <span>Итого</span>
        <span className="order-total__sum">{total} ₽</span>
      </div>

      <button className="btn btn--full">Оформить заказ</button>
    </section>
  );
}

// ─── Главный компонент приложения ─────────────────────────────────────────
export default function App() {
  // Активная категория фильтра
  const [activeCategory, setActiveCategory] = useState("Все");
  // Выбранное блюдо для модального окна (null = окно закрыто)
  const [selectedDish, setSelectedDish] = useState(null);
  // Активная вкладка: "menu" | "booking" | "order"
  const [tab, setTab] = useState("menu");
  // Корзина: массив объектов { uid, item, note }
  // uid — уникальный ключ, чтобы одно блюдо можно было добавить несколько раз
  const [cart, setCart] = useState([]);

  const categories = getCategories(menuData);

  // Фильтруем блюда по выбранной категории
  const filteredMenu =
    activeCategory === "Все"
      ? menuData
      : menuData.filter((item) => item.category === activeCategory);

  // Добавить позицию в корзину (note — строка пожеланий или null)
  function addToCart(item, note = null) {
    const uid = Date.now() + Math.random(); // простой уникальный ключ
    setCart((prev) => [...prev, { uid, item, note }]);
  }

  // Убрать одну позицию по uid
  function removeFromCart(uid) {
    setCart((prev) => prev.filter((entry) => entry.uid !== uid));
  }

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
            {/* Кнопка заказа со счётчиком позиций */}
            <button
              className={`nav-btn ${tab === "order" ? "nav-btn--active" : ""}`}
              onClick={() => setTab("order")}
            >
              Заказ
              {cart.length > 0 && (
                <span className="cart-badge">{cart.length}</span>
              )}
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
                  onAddToCart={(item) => addToCart(item)}
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

        {/* ── Вкладка: Мой заказ ── */}
        {tab === "order" && (
          <OrderTab
            cart={cart}
            onRemove={removeFromCart}
            onClear={() => setCart([])}
          />
        )}
      </main>

      {/* ── Модальное окно блюда ── */}
      {selectedDish && (
        <DishModal
          item={selectedDish}
          onClose={() => setSelectedDish(null)}
          onAddToCart={addToCart}
        />
      )}
    </div>
  );
}

// ─── Компонент: форма бронирования столика ────────────────────────────────
function BookingForm() {
  const initialState = {
    name: "",
    phone: "",
    date: "",
    time: "",
    guests: 2,
    zone: "non-smoking",
  };

  const [form, setForm] = useState(initialState);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
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

import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { OrderStatusBadge } from "./components/OrderStatusBadge";
import { QuantityPicker } from "./components/QuantityPicker";
import { PRODUCTS } from "./data";
import { fakePaymentApi } from "./lib/mockApi";
import { canRefund, canTransition } from "./lib/orderMachine";
import { calculatePrice } from "./lib/pricing";
import {
  validateAge,
  validateCardNumber,
  validateDisplayName,
  validateEmail,
  validatePostalCode,
  validateQty,
} from "./lib/validators";
import { useAppStore } from "./store/useAppStore";
import type { Category, CheckoutForm, Product } from "./types";

type Tab = "Catalog" | "Cart" | "Checkout" | "Orders" | "Settings" | "Docs";

const DOC_FILES = [
  {
    id: "requirements",
    label: "Requirements",
    path: "requirements.md",
  },
  {
    id: "blackbox",
    label: "Blackbox Template",
    path: "testcases-blackbox-template.md",
  },
  {
    id: "whitebox",
    label: "Whitebox Guide",
    path: "testcases-whitebox-guide.md",
  },
  {
    id: "bug-report",
    label: "Bug Report Template",
    path: "bug-report-template.md",
  },
  {
    id: "traceability",
    label: "Traceability Matrix",
    path: "traceability-matrix-template.md",
  },
] as const;

const PAGE_SIZE = 10;

function formatMoney(amount: number, currency: "PHP" | "USD"): string {
  if (currency === "USD") {
    return `$${amount.toFixed(2)}`;
  }
  return `PHP ${amount.toFixed(2)}`;
}

function App() {
  const {
    items,
    promoCode,
    cachedDiscount,
    orders,
    settings,
    addItem,
    updateQty,
    removeItem,
    clearCart,
    setPromoCode,
    setCachedDiscount,
    addOrder,
    updateOrderStatus,
    updateSettings,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<Tab>("Catalog");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"All" | Category>("All");
  const [sortBy, setSortBy] = useState<"name" | "price">("name");
  const [page, setPage] = useState(1);
  const [couponInput, setCouponInput] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedDocPath, setSelectedDocPath] = useState<string>(
    DOC_FILES[0].path,
  );
  const [docContent, setDocContent] = useState<string>("");
  const [docLoading, setDocLoading] = useState(false);

  const [form, setForm] = useState<CheckoutForm>({
    fullName: settings.displayName,
    email: "",
    age: "",
    postalCode: "",
    cardNumber: "",
    isStudent: false,
    isMember: false,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      const categoryMatch = category === "All" || product.category === category;
      const searchMatch =
        product.name.includes(search) || String(product.price).includes(search);
      return categoryMatch && searchMatch;
    });
  }, [category, search]);

  const sortedProducts = useMemo(() => {
    const next = [...filteredProducts];
    if (sortBy === "price") {
      next.sort((a, b) => String(a.price).localeCompare(String(b.price)));
    } else {
      next.sort((a, b) => a.name.localeCompare(b.name));
    }
    return next;
  }, [filteredProducts, sortBy]);

  const totalPages = Math.floor(sortedProducts.length / PAGE_SIZE) || 1;

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const productsOnPage = sortedProducts.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const priceBreakdown = useMemo(
    () =>
      calculatePrice({
        items,
        promoCode,
        isStudent: form.isStudent,
        isMember: form.isMember,
      }),
    [form.isMember, form.isStudent, items, promoCode],
  );

  useEffect(() => {
    setCachedDiscount(priceBreakdown.discount);
  }, [priceBreakdown.discount, setCachedDiscount]);

  useEffect(() => {
    let active = true;
    setDocLoading(true);

    fetch(`/docs/${selectedDocPath}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load markdown file");
        }
        return response.text();
      })
      .then((text) => {
        if (active) {
          setDocContent(text);
        }
      })
      .catch(() => {
        if (active) {
          setDocContent(
            "# Document unavailable\n\nTry refreshing or selecting another file.",
          );
        }
      })
      .finally(() => {
        if (active) {
          setDocLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [selectedDocPath]);

  function handleAddToCart(product: Product) {
    addItem(product);
    setNotice(`${product.name} added to cart.`);
  }

  function handleFormInput(key: keyof CheckoutForm, value: string | boolean) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function validateCheckout(): boolean {
    const errors: Record<string, string> = {};

    const nameError = validateDisplayName(form.fullName);
    if (nameError) {
      errors.fullName = nameError;
    }

    const emailError = validateEmail(form.email);
    if (emailError) {
      errors.email = emailError;
    }

    const ageError = validateAge(form.age);
    if (ageError) {
      errors.age = ageError;
    }

    const postalError = validatePostalCode(form.postalCode);
    if (postalError) {
      errors.postalCode = postalError;
    }

    const cardError = validateCardNumber(form.cardNumber);
    if (cardError) {
      errors.cardNumber = cardError;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handlePayNow() {
    if (!validateCheckout()) {
      setNotice("Please fix checkout errors first.");
      return;
    }

    const orderId = crypto.randomUUID();
    addOrder({
      id: orderId,
      customerName: form.fullName,
      createdAt: new Date().toISOString(),
      status: "Pending",
      items,
      total: priceBreakdown.total,
    });

    try {
      await fakePaymentApi();
      updateOrderStatus(orderId, "Paid");
      clearCart();
    } catch {
      setNotice("Payment attempt failed. Please try again.");
    } finally {
      setNotice("Order placed successfully.");
      setActiveTab("Orders");
    }
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="border-b border-ink/20 bg-gradient-to-r from-sun-200 via-orange-100 to-mint-100">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              CampusCart Midterm Lab
            </h1>
            <p className="text-sm text-ink/80">
              React + TypeScript + Zustand + Tailwind
            </p>
          </div>
          <div className="rounded-full bg-white px-4 py-2 text-sm shadow">
            Device ID: {settings.deviceId}
          </div>
        </div>
      </header>

      <nav className="mx-auto flex max-w-6xl flex-wrap gap-2 px-4 py-4">
        {(
          ["Catalog", "Cart", "Checkout", "Orders", "Settings", "Docs"] as Tab[]
        ).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab
                ? "bg-ink text-paper"
                : "bg-white text-ink ring-1 ring-ink/20 hover:bg-mint-100"
            }`}
          >
            {tab}
            {tab === "Cart" ? ` (${items.length})` : ""}
          </button>
        ))}
      </nav>

      {notice ? (
        <div className="mx-auto max-w-6xl px-4 pb-2">
          <div className="rounded bg-ink px-3 py-2 text-sm text-white">
            {notice}
          </div>
        </div>
      ) : null}

      <main className="mx-auto grid max-w-6xl gap-4 px-4 pb-10">
        {activeTab === "Catalog" ? (
          <section className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-ink/10">
            <div className="mb-4 grid gap-3 md:grid-cols-4">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name or price"
                className="rounded border border-ink/30 px-3 py-2"
              />
              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as "All" | Category)
                }
                className="rounded border border-ink/30 px-3 py-2"
              >
                <option value="All">All Categories</option>
                <option value="Books">Books</option>
                <option value="Supplies">Supplies</option>
                <option value="Electronics">Electronics</option>
                <option value="Snacks">Snacks</option>
              </select>
              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value as "name" | "price")
                }
                className="rounded border border-ink/30 px-3 py-2"
              >
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price</option>
              </select>
              <button
                type="button"
                className="rounded bg-sun-300 px-3 py-2 font-semibold"
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                  setSortBy("name");
                }}
              >
                Clear Filters
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {productsOnPage.map((product) => (
                <article
                  key={product.id}
                  className="rounded-xl border border-ink/20 p-3"
                >
                  <h2 className="truncate text-base font-semibold">
                    {product.name}
                  </h2>
                  <p className="text-sm text-ink/80">{product.category}</p>
                  <p className="mt-1 text-lg font-bold">
                    {formatMoney(product.price, settings.currency)}
                  </p>
                  <p className="mb-3 text-xs text-ink/70">
                    Stock: {product.stock}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleAddToCart(product)}
                    className="rounded bg-mint-300 px-3 py-2 text-sm font-semibold"
                  >
                    Add to Cart
                  </button>
                </article>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="rounded border border-ink/30 px-3 py-2 text-sm"
              >
                Previous
              </button>
              <p className="text-sm">
                Page {page} / {totalPages}
              </p>
              <button
                type="button"
                onClick={() => setPage((current) => current + 1)}
                className="rounded border border-ink/30 px-3 py-2 text-sm"
              >
                Next
              </button>
            </div>
          </section>
        ) : null}

        {activeTab === "Cart" ? (
          <section className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-ink/10">
            <h2 className="mb-3 text-xl font-semibold">Cart</h2>
            {items.length === 0 ? <p>Your cart is empty.</p> : null}

            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.name}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded border border-ink/20 p-3"
                >
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-ink/70">
                      {formatMoney(item.price, settings.currency)} each
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <QuantityPicker
                      value={item.qty}
                      onChange={(value) => {
                        const qtyError = validateQty(value);
                        if (qtyError) {
                          setNotice(qtyError);
                        }
                        updateQty(item.productId, value);
                      }}
                    />
                    <button
                      type="button"
                      aria-label="Delete item"
                      onClick={() => removeItem(item.productId)}
                      className="rounded bg-rose-200 px-3 py-2 text-sm font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
              <div className="flex gap-2">
                <input
                  className="w-full rounded border border-ink/30 px-3 py-2"
                  placeholder="Promo code: SAVE10 or FLAT50"
                  value={couponInput}
                  onChange={(event) => setCouponInput(event.target.value)}
                />
                <button
                  type="button"
                  className="rounded bg-amber-300 px-4 py-2 font-semibold"
                  onClick={() => setPromoCode(couponInput)}
                >
                  Apply
                </button>
              </div>
              <button
                type="button"
                className="rounded bg-ink px-4 py-2 text-sm font-semibold text-white"
                onClick={() => setActiveTab("Checkout")}
              >
                Proceed to Checkout
              </button>
            </div>

            <div className="mt-4 rounded-lg bg-slate-100 p-3 text-sm">
              <p>
                Subtotal:{" "}
                {formatMoney(priceBreakdown.subtotal, settings.currency)}
              </p>
              <p>
                Discount:{" "}
                {formatMoney(priceBreakdown.discount, settings.currency)}
              </p>
              <p>
                Shipping:{" "}
                {formatMoney(priceBreakdown.shipping, settings.currency)}
              </p>
              <p>Tax: {formatMoney(priceBreakdown.tax, settings.currency)}</p>
              <p className="mt-1 font-bold">
                Total: {formatMoney(priceBreakdown.total, settings.currency)}
              </p>
              <p className="mt-1 text-xs text-ink/70">
                Cached discount persisted:{" "}
                {formatMoney(cachedDiscount, settings.currency)}
              </p>
            </div>
          </section>
        ) : null}

        {activeTab === "Checkout" ? (
          <section className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-ink/10">
            <h2 className="mb-3 text-xl font-semibold">Checkout</h2>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="grid gap-1 text-sm">
                Full Name
                <input
                  className="rounded border border-ink/30 px-3 py-2"
                  value={form.fullName}
                  onChange={(event) =>
                    handleFormInput("fullName", event.target.value)
                  }
                />
                {formErrors.fullName ? (
                  <span className="text-xs text-rose-700">
                    {formErrors.fullName}
                  </span>
                ) : null}
              </label>

              <label className="grid gap-1 text-sm">
                Email
                <input
                  className="rounded border border-ink/30 px-3 py-2"
                  value={form.email}
                  onChange={(event) =>
                    handleFormInput("email", event.target.value)
                  }
                />
                {formErrors.email ? (
                  <span className="text-xs text-rose-700">
                    {formErrors.email}
                  </span>
                ) : null}
              </label>

              <label className="grid gap-1 text-sm">
                Age
                <input
                  type="number"
                  className="rounded border border-ink/30 px-3 py-2"
                  value={form.age}
                  onChange={(event) =>
                    handleFormInput("age", event.target.value)
                  }
                />
                {formErrors.age ? (
                  <span className="text-xs text-rose-700">
                    {formErrors.age}
                  </span>
                ) : null}
              </label>

              <label className="grid gap-1 text-sm">
                Postal Code
                <input
                  className="rounded border border-ink/30 px-3 py-2"
                  value={form.postalCode}
                  onChange={(event) =>
                    handleFormInput("postalCode", event.target.value)
                  }
                />
                {formErrors.postalCode ? (
                  <span className="text-xs text-rose-700">
                    {formErrors.postalCode}
                  </span>
                ) : null}
              </label>

              <label className="grid gap-1 text-sm md:col-span-2">
                Card Number
                <input
                  className="rounded border border-ink/30 px-3 py-2"
                  value={form.cardNumber}
                  onChange={(event) =>
                    handleFormInput("cardNumber", event.target.value)
                  }
                />
                {formErrors.cardNumber ? (
                  <span className="text-xs text-rose-700">
                    {formErrors.cardNumber}
                  </span>
                ) : null}
              </label>
            </div>

            <div className="my-3 flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isStudent}
                  onChange={(event) =>
                    handleFormInput("isStudent", event.target.checked)
                  }
                />
                Student (10%)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isMember}
                  onChange={(event) =>
                    handleFormInput("isMember", event.target.checked)
                  }
                />
                Member (15%)
              </label>
            </div>

            <div className="mb-4 rounded-lg bg-slate-100 p-3 text-sm">
              <p>
                Subtotal:{" "}
                {formatMoney(priceBreakdown.subtotal, settings.currency)}
              </p>
              <p>
                Discount:{" "}
                {formatMoney(priceBreakdown.discount, settings.currency)}
              </p>
              <p>
                Shipping:{" "}
                {formatMoney(priceBreakdown.shipping, settings.currency)}
              </p>
              <p>Tax: {formatMoney(priceBreakdown.tax, settings.currency)}</p>
              <p className="mt-1 font-bold">
                Total: {formatMoney(priceBreakdown.total, settings.currency)}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                className="rounded bg-ink px-4 py-2 text-sm font-semibold text-white"
                onClick={handlePayNow}
              >
                Pay Now
              </button>
              <button
                type="button"
                className="rounded border border-ink/30 px-4 py-2 text-sm"
                onClick={() => {
                  setForm({
                    fullName: settings.displayName,
                    email: "",
                    age: "",
                    postalCode: "",
                    cardNumber: "",
                    isStudent: false,
                    isMember: false,
                  });
                  setFormErrors({});
                }}
              >
                Reset Form
              </button>
            </div>
          </section>
        ) : null}

        {activeTab === "Orders" ? (
          <section className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-ink/10">
            <h2 className="mb-3 text-xl font-semibold">Orders</h2>
            {orders.length === 0 ? <p>No orders yet.</p> : null}

            <div className="space-y-3">
              {orders.map((order) => (
                <article
                  key={order.id}
                  className="rounded border border-ink/20 p-3"
                >
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">
                      {order.customerName || "Anonymous"} -{" "}
                      {order.id.slice(0, 8)}
                    </p>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="text-sm text-ink/80">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-ink/80">
                    Total: {formatMoney(order.total, settings.currency)}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {canTransition(order.status, "Paid") ? (
                      <button
                        type="button"
                        className="rounded bg-emerald-200 px-3 py-2 text-sm"
                        onClick={() => updateOrderStatus(order.id, "Paid")}
                      >
                        Mark Paid
                      </button>
                    ) : null}
                    {canTransition(order.status, "Cancelled") ? (
                      <button
                        type="button"
                        className="rounded bg-rose-200 px-3 py-2 text-sm"
                        onClick={() => updateOrderStatus(order.id, "Cancelled")}
                      >
                        Cancel
                      </button>
                    ) : null}
                    {canRefund(order.status) ? (
                      <button
                        type="button"
                        className="rounded bg-fuchsia-200 px-3 py-2 text-sm"
                        onClick={() => updateOrderStatus(order.id, "Refunded")}
                      >
                        Refund
                      </button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {activeTab === "Settings" ? (
          <section className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-ink/10">
            <h2 className="mb-3 text-xl font-semibold">Settings</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="grid gap-1 text-sm">
                Display Name
                <input
                  maxLength={20}
                  className="rounded border border-ink/30 px-3 py-2"
                  value={settings.displayName}
                  onChange={(event) =>
                    updateSettings({
                      displayName: event.target.value,
                    })
                  }
                />
              </label>
              <label className="grid gap-1 text-sm">
                Currency
                <select
                  className="rounded border border-ink/30 px-3 py-2"
                  value={settings.currency}
                  onChange={(event) =>
                    updateSettings({
                      currency: event.target.value as "PHP" | "USD",
                    })
                  }
                >
                  <option value="PHP">PHP</option>
                  <option value="USD">USD</option>
                </select>
              </label>
              <label className="grid gap-1 text-sm">
                Theme
                <select
                  className="rounded border border-ink/30 px-3 py-2"
                  value={settings.theme}
                  onChange={(event) =>
                    updateSettings({
                      theme: event.target.value as "sunset" | "mint",
                    })
                  }
                >
                  <option value="sunset">Sunset</option>
                  <option value="mint">Mint</option>
                </select>
              </label>
              <div className="text-sm">
                <p className="font-semibold">Validation Preview</p>
                <p className="text-ink/70">
                  {validateDisplayName(settings.displayName) ??
                    "Display name looks good."}
                </p>
              </div>
            </div>

            <button
              type="button"
              className="mt-4 rounded bg-zinc-300 px-3 py-2 text-sm"
              onClick={() => {
                localStorage.removeItem("campuscart-state-v1");
                setNotice("Data reset. Refresh page to see fresh state.");
              }}
            >
              Reset App Data
            </button>
          </section>
        ) : null}

        {activeTab === "Docs" ? (
          <section className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-ink/10">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">Student Docs</h2>
              <a
                href={`/docs/${selectedDocPath}`}
                target="_blank"
                rel="noreferrer"
                className="rounded border border-ink/30 px-3 py-2 text-sm hover:bg-slate-100"
              >
                Open Raw Markdown
              </a>
            </div>

            <div className="grid gap-4 md:grid-cols-[220px_1fr]">
              <aside className="rounded-xl border border-ink/20 bg-slate-50 p-2">
                {DOC_FILES.map((doc) => (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => setSelectedDocPath(doc.path)}
                    className={`mb-2 block w-full rounded px-3 py-2 text-left text-sm ${
                      selectedDocPath === doc.path
                        ? "bg-ink text-white"
                        : "bg-white text-ink hover:bg-mint-100"
                    }`}
                  >
                    {doc.label}
                  </button>
                ))}
              </aside>

              <article className="rounded-xl border border-ink/20 bg-white p-4">
                {docLoading ? (
                  <p className="text-sm text-ink/70">Loading document...</p>
                ) : (
                  <div className="max-w-none text-sm leading-7 text-ink">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ children }) => (
                          <h1 className="mb-3 mt-2 font-display text-2xl font-bold">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="mb-2 mt-5 font-display text-xl font-semibold">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="mb-2 mt-4 font-semibold">
                            {children}
                          </h3>
                        ),
                        p: ({ children }) => <p className="mb-3">{children}</p>,
                        li: ({ children }) => (
                          <li className="ml-5 list-disc">{children}</li>
                        ),
                        code: ({ children }) => (
                          <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">
                            {children}
                          </code>
                        ),
                        table: ({ children }) => (
                          <div className="mb-3 overflow-x-auto">
                            <table className="w-full min-w-[640px] border-collapse text-xs">
                              {children}
                            </table>
                          </div>
                        ),
                        th: ({ children }) => (
                          <th className="border border-slate-300 bg-slate-100 px-2 py-1 text-left">
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td className="border border-slate-300 px-2 py-1">
                            {children}
                          </td>
                        ),
                      }}
                    >
                      {docContent}
                    </ReactMarkdown>
                  </div>
                )}
              </article>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}

export default App;

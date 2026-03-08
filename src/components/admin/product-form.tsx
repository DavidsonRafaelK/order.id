"use client";

// =============================================================================
// src/components/admin/product-form.tsx
// Product list + add/edit modal for the admin products page.
// Handles creating and editing products via Server Actions.
// =============================================================================

import { useState, useTransition } from "react";
import {
    createProduct,
    toggleProductAvailability,
    updateProduct,
} from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import type { Product } from "@/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatRp(amount: number) {
    return `Rp ${amount.toLocaleString("id-ID")}`;
}

/** Parse a human-readable Rupiah string like "50.000" or "50000" → integer */
function parseRpInput(raw: string): number {
    const stripped = raw.replace(/[^\d]/g, "");
    const num = parseInt(stripped, 10);
    return isNaN(num) ? 0 : num;
}

/** Format integer → human-readable for input display, e.g. 50000 → "50.000" */
function formatRpInput(amount: number): string {
    if (amount === 0) return "";
    return amount.toLocaleString("id-ID");
}

// ---------------------------------------------------------------------------
// Product Form (Add / Edit)
// ---------------------------------------------------------------------------

interface ProductFormData {
    name: string;
    description: string;
    priceInput: string; // display string with dots, e.g. "50.000"
    imageUrl: string;
    category: string;
    stockInput: string; // empty = unlimited
    isNew: boolean;
    isAvailable: boolean;
}

const EMPTY_FORM: ProductFormData = {
    name: "",
    description: "",
    priceInput: "",
    imageUrl: "",
    category: "",
    stockInput: "",
    isNew: false,
    isAvailable: true,
};

function productToFormData(product: Product): ProductFormData {
    return {
        name: product.name,
        description: product.description ?? "",
        priceInput: formatRpInput(product.price),
        imageUrl: product.imageUrl ?? "",
        category: product.category ?? "",
        stockInput: product.stock != null ? String(product.stock) : "",
        isNew: product.isNew ?? false,
        isAvailable: product.isAvailable ?? true,
    };
}

interface ProductFormModalProps {
    editingProduct: Product | null;
    onClose: () => void;
    onSaved: (product: Product) => void;
}

function ProductFormModal({ editingProduct, onClose, onSaved }: ProductFormModalProps) {
    const { addToast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [form, setForm] = useState<ProductFormData>(
        editingProduct ? productToFormData(editingProduct) : EMPTY_FORM
    );
    const [errors, setErrors] = useState<Partial<ProductFormData>>({});

    const update = (field: keyof ProductFormData, value: string | boolean) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const handlePriceChange = (raw: string) => {
        // Allow only digits and formatting chars while typing
        const digits = raw.replace(/[^\d]/g, "");
        const num = parseInt(digits, 10);
        const formatted = !isNaN(num) ? num.toLocaleString("id-ID") : "";
        update("priceInput", formatted);
    };

    const validate = (): boolean => {
        const errs: Partial<ProductFormData> = {};
        if (!form.name.trim()) errs.name = "Nama produk wajib diisi";
        const price = parseRpInput(form.priceInput);
        if (price <= 0) errs.priceInput = "Harga harus lebih dari 0";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        const data = {
            name: form.name.trim(),
            description: form.description.trim() || null,
            price: parseRpInput(form.priceInput),
            imageUrl: form.imageUrl.trim() || null,
            category: form.category.trim() || null,
            stock: form.stockInput.trim() ? parseInt(form.stockInput, 10) : null,
            isNew: form.isNew,
            isAvailable: form.isAvailable,
        };

        startTransition(async () => {
            try {
                let saved: Product;
                if (editingProduct) {
                    saved = await updateProduct(editingProduct.id, data);
                } else {
                    saved = await createProduct(data);
                }
                addToast({
                    type: "success",
                    title: editingProduct ? "Produk diperbarui" : "Produk ditambahkan",
                });
                onSaved(saved);
            } catch (err) {
                addToast({
                    type: "error",
                    title: "Gagal menyimpan produk",
                    description: err instanceof Error ? err.message : "Coba lagi.",
                });
            }
        });
    };

    const inputClass = (hasError?: boolean) =>
        `w-full px-3 py-2.5 border-2 rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 transition-all ${hasError
            ? "border-destructive focus:ring-destructive/20"
            : "border-border focus:border-ring focus:ring-ring/20"
        }`;

    return (
        // Backdrop
        <div
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="w-full max-w-lg bg-card rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-5 border-b">
                    <h2 className="text-lg font-bold text-foreground">
                        {editingProduct ? "Edit Produk" : "Tambah Produk Baru"}
                    </h2>
                </div>

                {/* Scrollable body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <div className="px-6 py-5 space-y-5">
                        {/* Nama */}
                        <div className="space-y-1.5">
                            <label htmlFor="prod-name" className="block text-sm font-medium text-foreground">
                                Nama Produk <span className="text-destructive">*</span>
                            </label>
                            <input
                                id="prod-name"
                                type="text"
                                value={form.name}
                                onChange={(e) => update("name", e.target.value)}
                                placeholder="Contoh: Macaroni Schotel"
                                className={inputClass(!!errors.name)}
                            />
                            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                        </div>

                        {/* Deskripsi */}
                        <div className="space-y-1.5">
                            <label htmlFor="prod-desc" className="block text-sm font-medium text-foreground">
                                Deskripsi
                            </label>
                            <textarea
                                id="prod-desc"
                                value={form.description}
                                onChange={(e) => update("description", e.target.value)}
                                placeholder="Deskripsi singkat produk..."
                                rows={3}
                                className={`${inputClass()} resize-none`}
                            />
                        </div>

                        {/* Harga */}
                        <div className="space-y-1.5">
                            <label htmlFor="prod-price" className="block text-sm font-medium text-foreground">
                                Harga (IDR) <span className="text-destructive">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                                    Rp
                                </span>
                                <input
                                    id="prod-price"
                                    type="text"
                                    value={form.priceInput}
                                    onChange={(e) => handlePriceChange(e.target.value)}
                                    placeholder="50.000"
                                    inputMode="numeric"
                                    className={`${inputClass(!!errors.priceInput)} pl-10`}
                                />
                            </div>
                            {errors.priceInput && (
                                <p className="text-xs text-destructive">{errors.priceInput}</p>
                            )}
                        </div>

                        {/* Kategori + Stok (side by side) */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label htmlFor="prod-category" className="block text-sm font-medium text-foreground">
                                    Kategori
                                </label>
                                <input
                                    id="prod-category"
                                    type="text"
                                    value={form.category}
                                    onChange={(e) => update("category", e.target.value)}
                                    placeholder="Makanan Ringan"
                                    className={inputClass()}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="prod-stock" className="block text-sm font-medium text-foreground">
                                    Stok <span className="text-xs text-muted-foreground">(kosong = unlimited)</span>
                                </label>
                                <input
                                    id="prod-stock"
                                    type="number"
                                    min="0"
                                    value={form.stockInput}
                                    onChange={(e) => update("stockInput", e.target.value)}
                                    placeholder="—"
                                    className={inputClass()}
                                />
                            </div>
                        </div>

                        {/* URL Gambar */}
                        <div className="space-y-1.5">
                            <label htmlFor="prod-image" className="block text-sm font-medium text-foreground">
                                URL Gambar
                            </label>
                            <input
                                id="prod-image"
                                type="text"
                                value={form.imageUrl}
                                onChange={(e) => update("imageUrl", e.target.value)}
                                placeholder="/nama-produk.jpeg atau https://..."
                                className={inputClass()}
                            />
                            <p className="text-xs text-muted-foreground">
                                Untuk gambar lokal: letakkan file di folder <code>/public</code> dan tulis path-nya (contoh: <code>/macaroni-schotel.jpeg</code>).
                            </p>
                        </div>

                        {/* Toggles */}
                        <div className="flex flex-col gap-3 pt-1">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.isNew}
                                    onChange={(e) => update("isNew", e.target.checked)}
                                    className="w-4 h-4 accent-primary"
                                />
                                <span className="text-sm text-foreground">Tandai sebagai <strong>Menu Baru</strong></span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.isAvailable}
                                    onChange={(e) => update("isAvailable", e.target.checked)}
                                    className="w-4 h-4 accent-primary"
                                />
                                <span className="text-sm text-foreground">Produk <strong>Tersedia</strong> (tampil di katalog)</span>
                            </label>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t flex gap-3 justify-end">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    Menyimpan...
                                </span>
                            ) : editingProduct ? (
                                "Simpan Perubahan"
                            ) : (
                                "Tambah Produk"
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Products Manager (list + modal orchestration)
// ---------------------------------------------------------------------------

export function ProductsManager({ initialProducts }: { initialProducts: Product[] }) {
    const { addToast } = useToast();
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    const handleOpenAdd = () => {
        setEditingProduct(null);
        setShowModal(true);
    };

    const handleOpenEdit = (product: Product) => {
        setEditingProduct(product);
        setShowModal(true);
    };

    const handleClose = () => {
        setShowModal(false);
        setEditingProduct(null);
    };

    const handleSaved = (savedProduct: Product) => {
        setProducts((prev) => {
            const existing = prev.findIndex((p) => p.id === savedProduct.id);
            if (existing >= 0) {
                // Update in-place
                const next = [...prev];
                next[existing] = savedProduct;
                return next;
            }
            // Prepend new product
            return [savedProduct, ...prev];
        });
        handleClose();
    };

    const handleToggleAvailability = async (product: Product) => {
        setTogglingId(product.id);
        try {
            const updated = await toggleProductAvailability(product.id);
            setProducts((prev) =>
                prev.map((p) => (p.id === updated.id ? updated : p))
            );
            addToast({
                type: "success",
                title: updated.isAvailable ? "Produk diaktifkan" : "Produk dinonaktifkan",
                description: product.name,
            });
        } catch {
            addToast({ type: "error", title: "Gagal mengubah ketersediaan" });
        } finally {
            setTogglingId(null);
        }
    };

    return (
        <>
            {/* Action bar */}
            <div className="flex justify-end">
                <Button onClick={handleOpenAdd}>+ Tambah Produk</Button>
            </div>

            {/* Products table */}
            <div className="bg-card border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Produk</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Harga</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Kategori</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Stok</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-muted-foreground">
                                        Belum ada produk. Klik &quot;Tambah Produk&quot; untuk memulai.
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id} className="border-b hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="space-y-0.5">
                                                <p className="font-medium text-foreground">{product.name}</p>
                                                {product.isNew && (
                                                    <span className="text-xs text-green-600 font-medium">✨ Menu Baru</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-foreground">
                                            {formatRp(product.price)}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {product.category ?? "—"}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {product.stock != null ? product.stock : "∞"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => handleToggleAvailability(product)}
                                                disabled={togglingId === product.id}
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${product.isAvailable
                                                        ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
                                                        : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                                                    }`}
                                                aria-label={`${product.isAvailable ? "Nonaktifkan" : "Aktifkan"} ${product.name}`}
                                            >
                                                {togglingId === product.id ? (
                                                    <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <span>{product.isAvailable ? "●" : "○"}</span>
                                                )}
                                                {product.isAvailable ? "Tersedia" : "Nonaktif"}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleOpenEdit(product)}
                                                aria-label={`Edit ${product.name}`}
                                            >
                                                Edit
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-4 py-2 border-t bg-muted/30 text-xs text-muted-foreground">
                    {products.length} produk terdaftar
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <ProductFormModal
                    editingProduct={editingProduct}
                    onClose={handleClose}
                    onSaved={handleSaved}
                />
            )}
        </>
    );
}

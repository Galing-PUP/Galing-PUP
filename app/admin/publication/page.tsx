"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Menu,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import { FilterBox, FilterValues } from "@/components/filter-box";
import SortDropdown from "@/components/sort-dropdown";

type AdminPublication = {
  id: number;
  title: string;
  abstract: string;
  field: string;
  date: string;
};

// --- Configuration ---
const ITEMS_PER_PAGE = 10;

const COLORS = {
  maroon: "#800000",
  textMain: "#333333",
  textMuted: "#BC8D90",
  border: "#E5E5E5",
};

export default function PublicationPage() {
  const router = useRouter();

  // --- State ---
  const [publications, setPublications] = useState<AdminPublication[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [publicationToDelete, setPublicationToDelete] =
    useState<AdminPublication | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);

  const [filters, setFilters] = useState<FilterValues>({
    campus: "All Campuses",
    course: "All Courses",
    year: "All Years",
    documentType: "All Types",
  });

  type AdminSortOption =
    | "Newest to Oldest"
    | "Oldest to Newest"
    | "Title A-Z"
    | "Title Z-A";

  const [sortBy, setSortBy] = useState<AdminSortOption>("Newest to Oldest");

  // --- Load publications from backend ---
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/browse");
        if (!res.ok) {
          throw new Error(`Failed to load publications: ${res.status}`);
        }
        const response = await res.json();
        const data: {
          id: number;
          title: string;
          abstract: string;
          field: string;
          date: string;
        }[] = response.results || [];

        const mapped: AdminPublication[] = data.map((item) => ({
          id: item.id,
          title: item.title,
          abstract: item.abstract,
          field: item.field,
          date: item.date,
        }));

        setPublications(mapped);
      } catch (e) {
        console.error(e);
        setError("Failed to load publications from the database.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // --- Logic: Filtering ---
  const filteredData = useMemo(() => {
    let data = publications;

    // Search by title or field
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      data = data.filter(
        (pub) =>
          pub.title.toLowerCase().includes(lowerQuery) ||
          pub.field.toLowerCase().includes(lowerQuery),
      );
    }

    // Course filter (maps to field)
    if (filters.course !== "All Courses") {
      data = data.filter((pub) => pub.field === filters.course);
    }

    // Year filter (extract year from formatted date string)
    if (filters.year !== "All Years") {
      data = data.filter((pub) => pub.date.includes(filters.year));
    }

    // Document type / campus filters are not wired to DB fields yet

    // Sort
    const sorted = [...data].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);

      switch (sortBy) {
        case "Oldest to Newest":
          return dateA.getTime() - dateB.getTime();
        case "Title A-Z":
          return a.title.localeCompare(b.title);
        case "Title Z-A":
          return b.title.localeCompare(a.title);
        case "Newest to Oldest":
        default:
          return dateB.getTime() - dateA.getTime();
      }
    });

    return sorted;
  }, [publications, searchQuery, filters, sortBy]);

  const courseOptions = useMemo(() => {
    const set = new Set<string>();
    for (const pub of publications) {
      if (pub.field) set.add(pub.field);
    }
    return Array.from(set).sort();
  }, [publications]);

  // --- Logic: Pagination ---
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const currentData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  // --- Handlers ---

  // 1. Initiate Delete (Opens Modal)
  const handleDeleteClick = (pub: AdminPublication) => {
    setPublicationToDelete(pub);
    setIsDeleteModalOpen(true);
  };

  // 2. Confirm Delete (Performs Action)
  const confirmDelete = () => {
    if (publicationToDelete) {
      setPublications((prev) =>
        prev.filter((p) => p.id !== publicationToDelete.id),
      );

      // Reset logic if page becomes empty
      if (currentData.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }

      // Close Modal
      setIsDeleteModalOpen(false);
      setPublicationToDelete(null);
    }
  };

  // 3. Edit Handler
  const handleEdit = (id: number) => {
    router.push(`/admin/edit/${id}`);
  };

  // 4. Search Handler
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // 5. Pagination Handler
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="w-full h-full relative">
      {/* --- Top Actions --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        {/* Search Bar */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search size={20} color={COLORS.maroon} strokeWidth={1.5} />
          </div>
          <input
            type="text"
            placeholder="Search publications by title or keywords..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="block w-full pl-14 pr-32 py-3 text-gray-800 bg-transparent rounded-full border focus:ring-2 focus:outline-none transition-all"
            style={{ borderColor: COLORS.maroon }}
          />
          <div className="absolute inset-y-1 right-1 flex items-center">
            <button
              className="text-white rounded-full px-8 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: COLORS.maroon }}
            >
              Search
            </button>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center space-x-3 shrink-0">
          <button
            className="p-2.5 rounded-full border hover:bg-gray-200 transition-colors"
            style={{ borderColor: COLORS.maroon }}
            onClick={() => setIsFilterModalOpen(true)}
          >
            <Filter size={22} color={COLORS.maroon} strokeWidth={1.5} />
          </button>
          <button
            className="p-2.5 rounded-full border hover:bg-gray-200 transition-colors"
            style={{ borderColor: COLORS.maroon }}
            onClick={() => setIsSortModalOpen(true)}
          >
            <Menu size={22} color={COLORS.maroon} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* --- Data Table --- */}
      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b" style={{ borderColor: COLORS.border }}>
              <th
                className="py-4 pr-4 text-sm font-medium uppercase tracking-wider"
                style={{ color: COLORS.textMuted }}
              >
                Title
              </th>
              <th
                className="px-6 py-4 text-sm font-medium uppercase tracking-wider whitespace-nowrap"
                style={{ color: COLORS.textMuted }}
              >
                Publication Year
              </th>
              <th
                className="px-6 py-4 text-sm font-medium uppercase tracking-wider whitespace-nowrap"
                style={{ color: COLORS.textMuted }}
              >
                Research Field
              </th>
              <th
                className="px-6 py-4 text-sm font-medium uppercase tracking-wider text-right"
                style={{ color: COLORS.textMuted }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: COLORS.border }}>
            {loading ? (
              <tr>
                <td colSpan={4} className="py-10 text-center text-gray-500">
                  Loading publications...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={4} className="py-10 text-center text-red-600">
                  {error}
                </td>
              </tr>
            ) : currentData.length > 0 ? (
              currentData.map((pub) => {
                const year = pub.date.split(" ").pop();
                return (
                  <tr
                    key={pub.id}
                    className="group hover:bg-white/50 transition-colors"
                  >
                    <td
                      className="py-6 pr-6 leading-relaxed font-normal max-w-2xl"
                      style={{ color: COLORS.textMain }}
                    >
                      {pub.title}
                    </td>
                    <td
                      className="px-6 py-6 whitespace-nowrap"
                      style={{ color: COLORS.textMain }}
                    >
                      {year}
                    </td>
                    <td
                      className="px-6 py-6"
                      style={{ color: COLORS.textMain }}
                    >
                      <span className="capitalize">{pub.field}</span>
                    </td>
                    <td className="px-6 py-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-6">
                        <button
                          onClick={() => handleEdit(pub.id)}
                          className="hover:scale-110 transition-transform"
                        >
                          <Pencil
                            size={22}
                            color={COLORS.maroon}
                            strokeWidth={1.5}
                          />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(pub)} // Changed to open modal
                          className="hover:scale-110 transition-transform"
                        >
                          <Trash2
                            size={22}
                            color={COLORS.maroon}
                            strokeWidth={1.5}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-10 text-gray-500">
                  No publications found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- Pagination Controls --- */}
      {totalPages > 0 && (
        <div
          className="flex items-center justify-center space-x-8 mt-12 text-sm font-medium"
          style={{ color: COLORS.textMuted }}
        >
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center hover:text-gray-800 space-x-1 disabled:opacity-30"
          >
            <ChevronLeft size={16} /> <span>Previous</span>
          </button>
          <div className="flex items-center space-x-3">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`h-8 w-8 flex items-center justify-center rounded shadow-sm transition-colors ${currentPage === pageNum ? "text-white" : "hover:text-gray-800 hover:bg-gray-200"}`}
                  style={{
                    backgroundColor:
                      currentPage === pageNum ? COLORS.maroon : "transparent",
                  }}
                >
                  {pageNum}
                </button>
              ),
            )}
          </div>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center hover:text-gray-800 space-x-1 disabled:opacity-30"
          >
            <span>Next</span> <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* --- FILTER MODAL --- */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <button
              onClick={() => setIsFilterModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X size={20} />
            </button>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Filters
            </h2>
            <FilterBox
              courseOptions={courseOptions}
              onChange={(next) => {
                setFilters(next);
              }}
            />
          </div>
        </div>
      )}

      {/* --- SORT MODAL --- */}
      {isSortModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-xs rounded-2xl bg-white p-6 shadow-xl">
            <button
              onClick={() => setIsSortModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X size={20} />
            </button>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Sort by
            </h2>
            <SortDropdown
              value={sortBy}
              onChange={(value) => {
                setSortBy(value as AdminSortOption);
              }}
            />
          </div>
        </div>
      )}

      {/* --- CUSTOM DELETE MODAL --- */}
      {isDeleteModalOpen && publicationToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div
            className="bg-[#F9F9F9] rounded-2xl shadow-xl w-full max-w-lg p-8 relative animate-in fade-in zoom-in duration-200"
            role="dialog"
          >
            {/* Close Icon */}
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X size={24} />
            </button>

            {/* Modal Content */}
            <h2 className="text-3xl font-extrabold text-[#1a1a1a] mb-4">
              Are you sure?
            </h2>

            <p className="text-gray-600 mb-6 text-lg leading-relaxed">
              The chosen research will be permanently deleted from the database.
              This action cannot be undone.
            </p>

            <div className="text-gray-600 mb-8 text-lg">
              Research Title:{" "}
              <span className="font-bold" style={{ color: COLORS.maroon }}>
                {publicationToDelete.title}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-6 mt-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="font-bold text-lg hover:underline transition-all"
                style={{ color: COLORS.maroon }}
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="text-white px-8 py-3 rounded-full font-bold text-lg shadow-md hover:opacity-90 transition-opacity"
                style={{ backgroundColor: COLORS.maroon }}
              >
                Delete Research
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

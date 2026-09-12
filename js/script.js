
document.addEventListener("DOMContentLoaded", () => {
    const reportForm = document.querySelector(".report-form");
    const fileInput = document.getElementById("item-photo");
    const customFileLabel = document.querySelector(".custom-file-upload");
    const cardsGrid = document.getElementById("card-row");

    if (fileInput && customFileLabel) {
        fileInput.addEventListener("change", (event) => {
            const selectedFile = event.target.files[0];
            if (selectedFile) {
                customFileLabel.textContent = selectedFile.name;
                customFileLabel.style.backgroundColor = "#e0e7ff";
            }
        });
    }

    if (reportForm) {
        reportForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const newReport = {
                id: Date.now(),
                title: document.getElementById("itemname").value,
                date: document.getElementById("datefound").value,
                category: document.getElementById("category").value,
                location: document.getElementById("place-found").value,
                description: document.getElementById("item-description").value
            };
            const existingReports = JSON.parse(localStorage.getItem("uwc_reports")) || [];
            existingReports.push(newReport);
            localStorage.setItem("uwc_reports", JSON.stringify(existingReports));
            alert(`Thank you! Your report for "${newReport.title}" has been saved.`);
            reportForm.reset();
            if (customFileLabel) {
                customFileLabel.textContent = "Choose Image";
                customFileLabel.style.backgroundColor = "";
            }
        });
    }

    if (cardsGrid) {
        let savedReports = [];
        try {
            const storedReports = JSON.parse(localStorage.getItem("uwc_reports"));
            savedReports = Array.isArray(storedReports) ? storedReports : [];
        } catch (error) {
            localStorage.removeItem("uwc_reports");
        }
        savedReports.forEach((item) => {
            const title = String(item.title || "Reported item");
            const location = String(item.location || "Unknown location");
            const date = String(item.date || "");
            const card = document.createElement("div");
            card.className = "card saved-card";
            card.dataset.category = String(item.category || "other");
            card.dataset.date = date;
            card.dataset.location = location.toLowerCase();
            card.innerHTML = `
                <div class="card-content">
                    <h3 class="card-title">${escapeHTML(title)}</h3>
                    <div class="card-info">
                        <p><i class="fa-solid fa-location-dot" aria-hidden="true"></i> <strong>Location:</strong> ${escapeHTML(location)}</p>
                        <p><i class="fa-solid fa-calendar" aria-hidden="true"></i> <strong>Date Found:</strong> ${escapeHTML(date)}</p>
                    </div>
                </div>`;
            cardsGrid.appendChild(card);
        });
    }

    const searchInput = document.getElementById("search");
    const categoryFilter = document.getElementById("filter");
    const dateFilter = document.getElementById("date-lost");
    const locationInput = document.getElementById("location");
    const filterForm = document.querySelector(".find form");

    if (filterForm && cardsGrid && searchInput && categoryFilter && dateFilter && locationInput) {
        const filterCards = () => {
            const searchTerm = searchInput.value.trim().toLowerCase();
            const selectedCategory = categoryFilter.value;
            const selectedDate = dateFilter.value;
            const locationTerm = locationInput.value.trim().toLowerCase();
            cardsGrid.querySelectorAll(".card").forEach((card) => {
                const cardText = card.textContent.toLowerCase();
                const matchesSearch = !searchTerm || cardText.includes(searchTerm);
                const matchesCategory = selectedCategory === "all" || card.dataset.category === selectedCategory;
                const matchesDate = !selectedDate || card.dataset.date === selectedDate;
                const matchesLocation = !locationTerm || card.dataset.location.includes(locationTerm) || cardText.includes(locationTerm);
                card.hidden = !(matchesSearch && matchesCategory && matchesDate && matchesLocation);
            });
        };
        filterForm.addEventListener("submit", (event) => {
            event.preventDefault();
            filterCards();
        });
        searchInput.addEventListener("input", filterCards);
        categoryFilter.addEventListener("change", filterCards);
        dateFilter.addEventListener("change", filterCards);
        locationInput.addEventListener("input", filterCards);
    }
});

function escapeHTML(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;"
    })[character]);
}

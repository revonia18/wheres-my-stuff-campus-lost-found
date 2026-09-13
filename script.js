
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
        reportForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const selectedFile = fileInput.files[0];
            let image = "";
            try {
                image = await readFileAsDataURL(selectedFile);
            } catch (error) {
                showPopup("The image could not be saved. Please choose another image and try again.");
                return;
            }
            const newReport = {
                id: Date.now(),
                title: document.getElementById("itemname").value,
                date: document.getElementById("datefound").value,
                category: document.getElementById("category").value,
                location: document.getElementById("place-found").value,
                description: document.getElementById("item-description").value,
                image
            };
            const existingReports = JSON.parse(localStorage.getItem("uwc_reports")) || [];
            existingReports.push(newReport);
            localStorage.setItem("uwc_reports", JSON.stringify(existingReports));
            showPopup(`Thank you! Your report for "${newReport.title}" has been saved.`);
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
                    </div><br>
                    <a href="#" class="contact-btn">Contact Finder</a>
                </div>`;
            if (typeof item.image === "string" && item.image.startsWith("data:image/")) {
                const imageContainer = document.createElement("div");
                imageContainer.className = "card-image";
                const image = document.createElement("img");
                image.src = item.image;
                image.alt = title;
                imageContainer.appendChild(image);
                card.prepend(imageContainer);
            }
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

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject(new Error("No image selected"));
            return;
        }
        const reader = new FileReader();
        reader.addEventListener("load", () => resolve(reader.result));
        reader.addEventListener("error", () => reject(reader.error));
        reader.readAsDataURL(file);
    });
}

function showPopup(message) {
    const previousFocus = document.activeElement;
    const popup = document.createElement("div");
    popup.className = "popup-backdrop";
    popup.setAttribute("role", "presentation");
    popup.innerHTML = `
        <section class="popup" role="dialog" aria-modal="true" aria-labelledby="popup-title">
            <button class="popup-close" type="button" aria-label="Close message">&times;</button>
            <h2 id="popup-title">Report saved</h2>
            <p class="popup-message"></p>
            <button class="popup-action" type="button">Done</button>
        </section>`;
    popup.querySelector(".popup-message").textContent = message;
    document.body.appendChild(popup);

    let handleEscape;
    const closePopup = () => {
        popup.remove();
        document.removeEventListener("keydown", handleEscape);
        if (previousFocus instanceof HTMLElement) {
            previousFocus.focus();
        }
    };

    popup.querySelector(".popup-close").addEventListener("click", closePopup);
    popup.querySelector(".popup-action").addEventListener("click", closePopup);
    popup.addEventListener("click", (event) => {
        if (event.target === popup) {
            closePopup();
        }
    });
    handleEscape = (event) => {
        if (event.key === "Escape") {
            closePopup();
        }
    };
    document.addEventListener("keydown", handleEscape);
    popup.querySelector(".popup-action").focus();
}

function escapeHTML(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;"
    })[character]);
}

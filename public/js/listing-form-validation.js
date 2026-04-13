(function () {
    const forms = Array.from(document.querySelectorAll("[data-custom-validate]"));

    if (!forms.length) {
        return;
    }

    function getTrimmedValue(field) {
        if (field.type === "file") {
            return field.files && field.files.length ? field.files[0].name.trim() : "";
        }

        return field.value.trim();
    }

    function getErrorMessage(field) {
        const value = getTrimmedValue(field);
        const label = field.dataset.label || "This field";

        if (!value) {
            return field.hasAttribute("required") ? label + " is required." : "";
        }

        if (field.id === "image" && field.type !== "file") {
            try {
                const url = new URL(value);
                if (url.protocol !== "http:" && url.protocol !== "https:") {
                    return "Image URL must start with http:// or https://.";
                }
            } catch (error) {
                return "Enter a valid image URL.";
            }
        }

        if (field.id === "image" && field.type === "file" && field.files && field.files.length) {
            const file = field.files[0];
            const validTypes = ["image/jpeg", "image/png", "image/webp"];

            if (!validTypes.includes(file.type)) {
                return "Upload a JPG, PNG, or WEBP image.";
            }
        }

        if (field.id === "price") {
            const price = Number(value);

            if (Number.isNaN(price)) {
                return "Price must be a valid number.";
            }

            if (price < 0) {
                return "Price cannot be negative.";
            }
        }

        if (field.id === "rating") {
            const rating = Number(field.value);
            const min = Number(field.min || 1);
            const max = Number(field.max || 5);

            if (Number.isNaN(rating)) {
                return "Rating must be a valid number.";
            }

            if (rating < min || rating > max) {
                return "Rating must stay between " + min + " and " + max + ".";
            }
        }

        return "";
    }

    function showFieldError(field, message) {
        const errorId = field.dataset.errorTarget;
        const errorElement = document.getElementById(errorId);
        const fieldWrapper = field.closest(".form-field");

        field.classList.toggle("input-error", Boolean(message));
        if (fieldWrapper) {
            fieldWrapper.classList.toggle("field-error", Boolean(message));
        }
        field.setAttribute("aria-invalid", message ? "true" : "false");
        if (errorId) {
            field.setAttribute("aria-describedby", errorId);
        }

        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    function validateField(field) {
        const message = getErrorMessage(field);
        showFieldError(field, message);
        return !message;
    }

    function updateImagePreview(form) {
        const imageField = form.querySelector("#image");
        const preview = form.querySelector("[data-image-preview]");

        if (!imageField || !preview || imageField.type === "file") {
            return;
        }

        const value = getTrimmedValue(imageField);
        const defaultSrc = preview.dataset.defaultSrc || preview.getAttribute("src");
        const imageMessage = value ? getErrorMessage(imageField) : "";

        if (!value || imageMessage) {
            preview.src = defaultSrc;
            return;
        }

        preview.src = value;
    }

    function updateFileSelection(field) {
        if (field.type !== "file") {
            return;
        }

        const fileName = field.dataset.fileNameTarget
            ? document.getElementById(field.dataset.fileNameTarget)
            : null;
        const panel = field.closest(".upload-image-panel");
        const hasFile = Boolean(field.files && field.files.length);

        if (panel) {
            panel.classList.toggle("has-file", hasFile);
        }

        if (fileName) {
            fileName.textContent = hasFile ? field.files[0].name : "No file selected";
        }
    }

    function updateFormAlert(alertBox, fields) {
        const invalidFields = fields.filter((field) => field.classList.contains("input-error"));

        if (!invalidFields.length) {
            alertBox.hidden = true;
            alertBox.textContent = "";
            return;
        }

        alertBox.hidden = false;
        alertBox.textContent = "Please fix the highlighted fields before submitting.";
    }

    forms.forEach(function (form) {
        const alertBox = form.querySelector("[data-form-alert]");
        const fields = Array.from(form.querySelectorAll("[data-error-target]"));

        updateImagePreview(form);
        fields.forEach(updateFileSelection);

        fields.forEach((field) => {
            field.addEventListener("blur", function () {
                validateField(field);
                updateImagePreview(form);
                updateFileSelection(field);
                updateFormAlert(alertBox, fields);
            });

            field.addEventListener("input", function () {
                if (field.id === "image") {
                    updateImagePreview(form);
                }

                updateFileSelection(field);

                if (!field.classList.contains("input-error")) {
                    return;
                }

                validateField(field);
                updateFormAlert(alertBox, fields);
            });

            field.addEventListener("change", function () {
                validateField(field);
                updateImagePreview(form);
                updateFileSelection(field);
                updateFormAlert(alertBox, fields);
            });
        });

        form.addEventListener("submit", function (event) {
            const invalidFields = fields.filter((field) => !validateField(field));
            const firstInvalidField = invalidFields[0];

            updateImagePreview(form);
            updateFormAlert(alertBox, fields);

            if (!firstInvalidField) {
                return;
            }

            event.preventDefault();
            firstInvalidField.focus();
        });
    });
})();

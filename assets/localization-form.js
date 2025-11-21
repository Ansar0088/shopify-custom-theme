class LocalizationForm extends HTMLElement {
  constructor() {
    super();
    // Initialize elements placeholder but do not query them yet
    this.elements = {};

    // Bind event handlers once in the constructor
    this.openSelector = this.openSelector.bind(this);
    this.hidePanel = this.hidePanel.bind(this);
    this.onContainerKeyUp = this.onContainerKeyUp.bind(this);
    this.onItemClick = this.onItemClick.bind(this);
  }

  connectedCallback() {
    this.elements = {
      button: this.querySelector(".localization-selector__button"),
      panel: this.querySelector(".localization-selector__list"),
      // Get the form element here, as it's often needed outside onItemClick
      form: this.querySelector("form"),
    };

    if (this.elements.button && this.elements.form) {
      // 1. Event Listeners for Opening/Closing
      this.elements.button.addEventListener("click", this.openSelector);
      this.addEventListener("keyup", this.onContainerKeyUp);
      
      // *** FIX: Use 'focusout' on the entire component, not just the button ***
      // This ensures the panel stays open while focusing on list items
      this.addEventListener("focusout", this.closeSelector.bind(this)); 

      // 2. Event Listener for Clicking an Item
      this.querySelectorAll("a").forEach((item) =>
        item.addEventListener("click", this.onItemClick)
      );
    } else {
      console.error("Localization form elements (button or form) not found.");
    }
  }

  disconnectedCallback() {
    if (this.elements.button) {
      this.elements.button.removeEventListener("click", this.openSelector);
      this.removeEventListener("keyup", this.onContainerKeyUp);
      this.removeEventListener("focusout", this.closeSelector);
      
      this.querySelectorAll("a").forEach((item) =>
        item.removeEventListener("click", this.onItemClick)
      );
    }
  }

  // Helper function to hide the dropdown panel
  hidePanel() {
    if (this.elements.button) {
      this.elements.button.setAttribute("aria-expanded", "false");
    }
    if (this.elements.panel) {
      this.elements.panel.setAttribute("hidden", true);
    }
  }

  openSelector() {
    this.elements.button.focus();
    this.elements.panel.toggleAttribute("hidden");
    this.elements.button.setAttribute(
      "aria-expanded",
      (
        this.elements.button.getAttribute("aria-expanded") === "false"
      ).toString()
    );
  }

  closeSelector(event) {
    // Hide the panel only if the focus has left the entire custom element
    if (!this.contains(event.relatedTarget)) {
      this.hidePanel();
    }
  }

  onContainerKeyUp(event) {
    if (event.code.toUpperCase() !== "ESCAPE") return;

    this.hidePanel();
    this.elements.button.focus();
  }

  onItemClick(event) {
    event.preventDefault();

    // The form element is already queried in connectedCallback
    const form = this.elements.form; 
    if (!form) {
        console.error("Localization form element not found within custom tag.");
        return;
    }

    // 1. Update the target input value
    const targetInputName = event.currentTarget.dataset.inputName; // should be 'language_code'
    const targetValue = event.currentTarget.dataset.value;

    const inputToUpdate = form.querySelector(
      `input[name="${targetInputName}"]`
    );

    if (inputToUpdate) {
      inputToUpdate.value = targetValue;
    }

    // 2. Submit the form using the browser's native submission method
    form.submit();
  }
}

// Define the custom element only if it hasn't been defined yet
if (!customElements.get("localization-form")) {
  customElements.define("localization-form", LocalizationForm);
}
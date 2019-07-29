import { IInputs, IOutputs } from "./generated/ManifestTypes";

export class AddressAutocomplete implements ComponentFramework.StandardControl<IInputs, IOutputs> {

    private notifyOutputChanged: () => void;
    private searchBox: HTMLInputElement;

    private autocomplete: google.maps.places.Autocomplete;
    private value: string;
    private street: string;
    private city: string;
    private county: string;
    private state: string;
    private zipcode: string;
    private country: string;

    constructor() {

    }

    public init(context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary,
        container: HTMLDivElement) {
        if (typeof (context.parameters.googleapikey) === "undefined" ||
            typeof (context.parameters.googleapikey.raw) === "undefined") {
            container.innerHTML = "Please provide a valid google api key";
            return;
        }

        this.notifyOutputChanged = notifyOutputChanged;

        this.searchBox = document.createElement("input");
        //this.searchBox.setAttribute("id", "searchBox");
        this.searchBox.className = "addressAutocomplete";
        this.searchBox.addEventListener("mouseenter", this.onMouseEnter.bind(this));
        this.searchBox.addEventListener("mouseleave", this.onMouseLeave.bind(this));

        container.appendChild(this.searchBox);

        let googleApiKey = context.parameters.googleapikey.raw;
        let scriptUrl = "https://maps.googleapis.com/maps/api/js?libraries=places&language=en&key=" + googleApiKey;

        let scriptNode = document.createElement("script");
        scriptNode.setAttribute("type", "text/javascript");
        scriptNode.setAttribute("src", scriptUrl);
        document.head.appendChild(scriptNode);

        window.setTimeout(() => {
            this.autocomplete = new google.maps.places.Autocomplete(
                this.searchBox, { types: ['geocode'] });

            // When the user selects an address from the drop-down, populate the
            // address fields in the form.
            this.autocomplete.addListener('place_changed', () => {
                let place = this.autocomplete.getPlace();
                if (place == null || place.address_components == null) {
                    return;
                }

                this.value = "";
                this.street = "";
                this.city = "";
                this.county = "";
                this.state = "";
                this.country = "";
                this.zipcode = "";

                let streetNumber = "";

                for (var i = 0; i < place.address_components.length; i++) {
                    let addressComponent = place.address_components[i];
                    let componentType = addressComponent.types[0];
                    let addressPiece = addressComponent.long_name;

                    switch (componentType) {
                        case "street_number":
                            streetNumber = ", " + addressPiece;
                            break;
                        case "route":
                            this.street = addressPiece + streetNumber;
                            break;
                        case "locality":
                            this.city = addressPiece;
                            break;
                        case "administrative_area_level_2":
                            this.county = addressPiece;
                            break;
                        case "administrative_area_level_1":
                            this.state = addressPiece;
                            break;
                        case "country":
                            this.country = addressPiece;
                            break;
                        case "postal_code":
                            this.zipcode = addressPiece;
                            break;
                    }

                }

                this.value = place.formatted_address || "";
                this.notifyOutputChanged();
            });
        },
            1000);
    }

    private onMouseEnter(): void {
        this.searchBox.className = "addressAutocompleteFocused";
    }

    private onMouseLeave(): void {
        this.searchBox.className = "addressAutocomplete";
    }


	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
    public updateView(context: ComponentFramework.Context<IInputs>): void {
        // Add code to update control view
    }

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
    public getOutputs(): IOutputs {
        return {
            value: this.value,
            street: this.street,
            city: this.city,
            county: this.county,
            state: this.state,
            country: this.country,
            zipcode: this.zipcode
        };
    }

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
    public destroy(): void {
        // Add code to cleanup control if necessary
    }
}
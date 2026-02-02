import { validatePet, validatePartialPet } from './schemas/pet.js';

console.log("Testing validatePet (Create)...");
const createInput = {
    name: "Rex",
    species: "dog",
    breed: "Labrador",
    age: 5,
    age_unit: "years",
    size: "medium",
    color: "Brown",
    gender: "male",
    description: "A good boy",
    images: ["http://example.com/img1.jpg"],
    is_urgent: false,
    is_friendly: true,
    is_trained: true,
    is_vaccinated: true,
    is_neutered: true,
    energy_level: "medium",
    location: "New York",
    images_to_keep: ["should_be_stripped"]
};
const createResult = validatePet(createInput);
if (createResult.success) {
    if (createResult.data.images_to_keep) {
        console.error("FAIL: images_to_keep was preserved in validatePet");
    } else {
        console.log("PASS: images_to_keep was stripped in validatePet");
    }
} else {
    console.error("FAIL: Valid pet input failed validation:", createResult.error);
}

console.log("\nTesting validatePartialPet (Update)...");
const updateInput = {
    images_to_keep: ["img1.jpg", "img2.jpg"],
    name: "Rex Updated"
};
const updateResult = validatePartialPet(updateInput);
if (updateResult.success) {
    if (updateResult.data.images_to_keep && updateResult.data.images_to_keep.length === 2) {
        console.log("PASS: images_to_keep was preserved in validatePartialPet");
    } else {
        console.error("FAIL: images_to_keep was missing or invalid in validatePartialPet result", updateResult.data);
    }
} else {
    console.error("FAIL: Valid partial input failed validation:", updateResult.error);
}

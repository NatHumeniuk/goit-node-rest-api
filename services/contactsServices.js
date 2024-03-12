import Contact from "../models/Contact.js";

export const listContacts = () => Contact.find({});

export const getContactById = (id) => Contact.findById(id);

export const removeContact = (id) => Contact.findByIdAndDelete(id);

export const addContact = ({ name, email, phone }) =>
  Contact.create({ name, email, phone });

export const updateContact = (id, data) => Contact.findByIdAndUpdate(id, data);

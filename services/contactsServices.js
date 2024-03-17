import Contact from "../models/Contact.js";

export const listContacts = (filter = {}, query = {}) =>
  Contact.find(filter, "-createdAt -updatedAt", query).populate("owner");

export const getContactById = (filter) => Contact.findOne(filter);

export const removeContact = (filter) => Contact.findOneAndDelete(filter);

export const addContact = (data) => Contact.create(data);

export const updateContact = (filter, data) =>
  Contact.findOneAndUpdate(filter, data);

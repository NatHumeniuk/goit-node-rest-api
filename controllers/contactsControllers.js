import * as contactsServices from "../services/contactsServices.js";
import HttpError from "../helpers/HttpError.js";
import {
  createContactSchema,
  updateContactSchema,
  updateStatusContactSchema,
} from "../schemas/contactsSchemas.js";

export const getAllContacts = async (req, res, next) => {
  try {
    const { _id: owner } = req.user;
    const { page = 1, limit = 18, favorite } = req.query;
    const skip = (page - 1) * limit;
    const filter = { owner };
    if (favorite !== undefined) {
      filter.favorite = favorite === "true";
    }
    const result = await contactsServices.listContacts(filter, { skip, limit });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getOneContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { _id: owner } = req.user;
    const result = await contactsServices.getContactById({ _id: id, owner });
    if (!result) {
      throw HttpError(404, `Not found`);
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { _id: owner } = req.user;
    const result = await contactsServices.removeContact({ _id: id, owner });
    if (!result) {
      throw HttpError(404, `Not found`);
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const createContact = async (req, res, next) => {
  try {
    const { _id: owner } = req.user;

    const result = await contactsServices.addContact({ ...req.body, owner });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { _id: owner } = req.user;
    const result = await contactsServices.updateContact(
      { _id: id, owner },
      req.body
    );
    if (!result) {
      throw HttpError(404, `Not found`);
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const updateStatusContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { favorite } = req.body;
    const { _id: owner } = req.user;
    const { error } = updateStatusContactSchema.validate({ favorite });
    if (error) {
      throw HttpError(400, error.message);
    }

    const result = await contactsServices.updateContact(
      { _id: id, owner },
      {
        favorite,
      }
    );
    if (!result) {
      throw HttpError(404, `Not found`);
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};

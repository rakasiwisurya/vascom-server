const fs = require("fs");
const Joi = require("joi");
const { Op, where, fn, col } = require("sequelize");
const { Product } = require("../../models");

exports.addProduct = async (req, res) => {
  const schema = Joi.object({
    title: Joi.string().required(),
    price: Joi.number().required(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).send({
      code: 400,
      message: error.details[0].message,
      data: null,
    });
  }

  try {
    const photo = req.file && `${req.file.filename}`;
    await Product.create({ ...req.body, photo, status: "ACTIVE" });
    res.send({
      status: 200,
      message: "Success add new product",
      data: null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      code: 500,
      message: error.message,
      data: null,
    });
  }
};

exports.getProducts = async (req, res) => {
  const { page, limit, search, isNew, status } = req.query;

  const schema = Joi.object({
    page: Joi.number(),
    limit: Joi.number(),
    search: Joi.string(),
    status: Joi.string(),
    isNew: Joi.boolean(),
  });

  const { error } = schema.validate(req.query);

  if (error) {
    return res.status(400).send({
      code: 400,
      message: error.details[0].message,
      data: null,
    });
  }

  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    console.log("oneMonthAgo", oneMonthAgo);

    const totalData = await Product.count({
      ...((search || isNew) && {
        where: {
          ...(search && {
            title: where(fn("LOWER", col("title")), "LIKE", `%${search.toLowerCase()}%`),
          }),
          ...(isNew && {
            createdAt: {
              [Op.lt]: oneMonthAgo,
            },
          }),
          ...(status && {
            status,
          }),
        },
      }),
    });

    let data = await Product.findAll({
      ...((search || isNew) && {
        where: {
          ...(search && {
            title: where(fn("LOWER", col("title")), "LIKE", `%${search.toLowerCase()}%`),
          }),
          ...(isNew && {
            createdAt: {
              [Op.gte]: oneMonthAgo,
            },
          }),
          ...(status && {
            status,
          }),
        },
      }),
      offset: page ? +page * +limit - +limit : undefined,
      limit: limit ? +limit : undefined,
      attributes: {
        exclude: ["updatedAt"],
      },
      order: [["createdAt", "DESC"]],
    });

    data = JSON.parse(JSON.stringify(data));
    const newData = data.map((item) => ({
      ...item,
      photo: item.photo
        ? `${req.protocol}://${req.headers.host}/${process.env.UPLOAD_PATH_PRODUCT}/${item.photo}`
        : item.photo,
    }));

    res.send({
      code: 200,
      message: "Success get products",
      data: {
        page: +page,
        totalData,
        limit: +limit,
        data: newData,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      code: 500,
      message: error.message,
      data: null,
    });
  }
};

exports.getProduct = async (req, res) => {
  const { id } = req.params;

  const schema = Joi.object({
    id: Joi.number().required(),
  });

  const { error } = schema.validate(req.params);

  if (error) {
    return res.status(400).send({
      code: 400,
      message: error.details[0].message,
      data: null,
    });
  }

  try {
    let data = await Product.findOne({
      where: { id },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });

    if (!data) {
      return res.status(400).send({
        code: 400,
        message: "Product doesn't exist",
        data: null,
      });
    }

    data = JSON.parse(JSON.stringify(data));
    const newData = {
      ...data,
      photo: data.photo
        ? `${req.protocol}://${req.headers.host}/${process.env.UPLOAD_PATH_PRODUCT}/${data.photo}`
        : data.photo,
    };

    res.send({
      code: 200,
      message: "Success get detail product",
      data: newData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      code: 500,
      message: error.message,
      data: null,
    });
  }
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const schema = Joi.object({
    id: Joi.number().required(),
    title: Joi.string(),
    price: Joi.number(),
  });

  const { error } = schema.validate({ ...req.body, id });

  if (error) {
    return res.status(400).send({
      code: 400,
      message: error.details[0].message,
      data: null,
    });
  }

  try {
    const data = await Product.findOne({
      where: { id },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });

    if (!data) {
      if (req.file) {
        fs.unlink(`${process.env.UPLOAD_PATH_PRODUCT}/${req.file.filename}`, (err) => {
          if (err) {
            console.error(err);
            return err;
          }
        });
      }

      return res.status(400).send({
        code: 400,
        message: "Product doesn't exist",
        data: null,
      });
    }

    if (req.file && data.photo) {
      fs.unlink(`${process.env.UPLOAD_PATH_PRODUCT}/${data.photo}`, (err) => {
        if (err) {
          console.error(err);
          return err;
        }
      });
    }

    const photo = req.file && `${req.file.filename}`;
    await Product.update(
      { ...req.body, photo },
      {
        where: { id },
        attributes: {
          exclude: ["createdAt", "updatedAt", "password"],
        },
      }
    );

    res.send({
      code: 200,
      message: "Success update product",
      data: null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      code: 500,
      message: error.message,
      data: null,
    });
  }
};

exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  const schema = Joi.object({
    id: Joi.number().required(),
  });

  const { error } = schema.validate(req.params);

  if (error) {
    return res.status(400).send({
      code: 400,
      message: error.details[0].message,
      data: null,
    });
  }

  try {
    const productId = await Product.findOne({
      where: { id },
      attributes: {
        exclude: ["createdAt", "updatedAt", "password"],
      },
    });

    if (!productId) {
      return res.status(400).send({
        code: 400,
        message: "Product doesn't exist",
        data: null,
      });
    }

    await Product.update(
      { status: "NONACTIVE" },
      {
        where: { id },
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      }
    );

    res.send({
      code: 200,
      message: "Success delete product",
      data: null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      code: 500,
      message: error.message,
      data: null,
    });
  }
};

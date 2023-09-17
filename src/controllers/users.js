const bcrypt = require("bcrypt");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const generatePassword = require("password-generator");
const { User } = require("../../models");
const { Op } = require("sequelize");

exports.register = async (req, res) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    name: Joi.string().required(),
    phone: Joi.string(),
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
    const userEmail = await User.findOne({
      where: {
        email: req.body.email,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });

    if (userEmail) {
      return res.status(400).send({
        code: 400,
        message: "Email already exist",
        data: null,
      });
    }

    const randomPassword = generatePassword(12, false);

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      secure: false,
      auth: {
        user: "mytestemail908@gmail.com",
        pass: "halcqemindmkclbk",
      },
    });

    const mailOptions = {
      from: "mytestemail908@gmail.com",
      to: req.body.email,
      subject: "Vascom Secret Random Password",
      text: `Password: ${randomPassword}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(`Error sending email: ${req.body.email}`);
        return res.status(500).send({ code: 500, message: error.message, data: null });
      }
    });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(randomPassword, salt);

    let data = await User.create({
      ...req.body,
      password: hashedPassword,
      status: "ACTIVE",
      role: "USER",
    });

    data = JSON.parse(JSON.stringify(data));
    delete data.password;

    const token = jwt.sign(data, process.env.TOKEN_KEY);

    res.status(201).send({
      code: 201,
      message: "Your account has succesfully created",
      data: { ...data, token },
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

exports.login = async (req, res) => {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
    isAdmin: Joi.boolean(),
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
    let data = await User.findOne({
      where: {
        [Op.or]: {
          email: req.body.username,
          phone: req.body.username,
        },
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });

    if (!data) {
      return res.status(400).send({
        code: 400,
        message: "Email or password is incorrect",
        data: null,
      });
    }

    const isValid = await bcrypt.compare(req.body.password, data.password);

    if (!isValid) {
      return res.status(400).send({
        code: 400,
        message: "Email or password is incorrect",
        data: null,
      });
    }

    if (data.status === "NONACTIVE") {
      return res.status(400).send({
        code: 400,
        message: "Your account is already non active",
        data: null,
      });
    }

    if (req.body.isAdmin) {
      if (data.role !== "ADMIN") {
        return res.status(403).send({
          code: 403,
          message: "Forbidden, You are not an administrator",
          data: null,
        });
      }
    }

    data = JSON.parse(JSON.stringify(data));
    delete data.password;

    const token = jwt.sign(data, process.env.TOKEN_KEY);

    res.send({
      code: 200,
      message: "Login success",
      data: { ...data, token },
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

exports.getUsers = async (req, res) => {
  const { page, limit } = req.query;

  const schema = Joi.object({
    page: Joi.number().required(),
    limit: Joi.number().required(),
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
    const totalData = await User.count();

    let data = await User.findAll({
      offset: +page * +limit - +limit,
      limit: +limit,
      attributes: {
        exclude: ["updatedAt", "password"],
      },
      order: [["createdAt", "DESC"]],
    });

    data = JSON.parse(JSON.stringify(data));
    const newData = data.map((item) => ({
      ...item,
      avatar: item.avatar
        ? `${req.headers.host}/${process.env.UPLOAD_PATH_AVATAR}/${item.avatar}`
        : item.avatar,
    }));

    res.send({
      code: 200,
      message: "Success get users",
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

exports.getUser = async (req, res) => {
  const { id } = req.params;

  const schema = Joi.object({
    id: Joi.string().required(),
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
    let data = await User.findOne({
      where: { id },
      attributes: {
        exclude: ["createdAt", "updatedAt", "password"],
      },
    });

    if (!data) {
      return res.status(400).send({
        code: 400,
        message: "User doesn't exist",
        data: null,
      });
    }

    data = JSON.parse(JSON.stringify(data));

    const newData = {
      ...data,
      avatar: data.avatar
        ? `${req.headers.host}/${process.env.UPLOAD_PATH_AVATAR}/${data.avatar}`
        : data.avatar,
    };

    res.send({
      code: 200,
      message: "Success get detail user",
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

exports.updateUser = async (req, res) => {
  const { id } = req.params;

  const schema = Joi.object({
    id: Joi.string().required(),
    email: Joi.string().email().required(),
    name: Joi.string().required(),
    phone: Joi.string(),
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
    const userId = await User.findOne({
      where: { id },
      attributes: {
        exclude: ["createdAt", "updatedAt", "password"],
      },
    });

    if (!userId) {
      return res.status(400).send({
        code: 400,
        message: "User doesn't exist",
        data: null,
      });
    }

    await User.update(req.body, {
      where: { id },
      attributes: {
        exclude: ["createdAt", "updatedAt", "password"],
      },
    });

    res.send({
      code: 200,
      message: "Success update user",
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

exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  const schema = Joi.object({
    id: Joi.string().required(),
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
    const userId = await User.findOne({
      where: { id },
      attributes: {
        exclude: ["createdAt", "updatedAt", "password"],
      },
    });

    if (!userId) {
      return res.status(400).send({
        code: 400,
        message: "User doesn't exist",
        data: null,
      });
    }

    await User.update(
      { status: "NONACTIVE" },
      {
        where: { id },
        attributes: {
          exclude: ["createdAt", "updatedAt", "password"],
        },
      }
    );

    res.send({
      code: 200,
      message: "Success delete user",
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

exports.avatar = async (req, res) => {
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
    const data = await User.findOne({
      where: { id },
      attributes: {
        exclude: ["createdAt", "updatedAt", "password"],
      },
    });

    if (!data) {
      if (req.file) {
        fs.unlink(`${process.env.UPLOAD_PATH_AVATAR}/${req.file.filename}`, (err) => {
          if (err) {
            console.error(err);
            return err;
          }
        });
      }

      return res.status(400).send({
        code: 400,
        message: "User doesn't exist",
        data: null,
      });
    }

    if (req.file && data.avatar) {
      fs.unlink(`${process.env.UPLOAD_PATH_AVATAR}/${data.avatar}`, (err) => {
        if (err) {
          console.error(err);
          return err;
        }
      });
    }

    const avatar = req.file && `${req.file.filename}`;
    await User.update(
      { avatar },
      {
        where: { id },
        attributes: {
          exclude: ["createdAt", "updatedAt", "password"],
        },
      }
    );

    res.send({
      code: 200,
      message: "Success upload avatar",
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

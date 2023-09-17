const { User, Product } = require("../../models");

exports.getDashboard = async (req, res) => {
  try {
    const users = await User.count();
    const activeUsers = await User.count({
      where: {
        status: "ACTIVE",
      },
    });
    const products = await Product.count();
    const activeProducts = await Product.count({
      where: {
        status: "ACTIVE",
      },
    });

    res.send({
      code: 200,
      message: "Success get dashboard",
      data: {
        users,
        activeUsers,
        products,
        activeProducts,
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

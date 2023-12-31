const jwt = require("jsonwebtoken");

exports.auth = (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).send({
      code: 401,
      message: "Unauthorized",
      data: null,
    });
  }

  try {
    const verified = jwt.verify(token, process.env.TOKEN_KEY);
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).send({
      code: 401,
      message: "Invalid token",
      data: null,
    });
  }
};

exports.adminOnly = (req, res, next) => {
  if (req.user.role && req.user.role === "ADMIN") return next();

  res.status(403).send({
    code: 403,
    message: "Forbidden",
    data: null,
  });
};

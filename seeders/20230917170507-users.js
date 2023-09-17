"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */

    await queryInterface.bulkInsert("users", [
      {
        name: "Administrator",
        phone: "085715519999",
        email: "admin.vascom@gmail.com",
        password: "$2a$10$2mtiMYTnx04DtRwEsq9BnuotBOAIWhSNy1ZxtSLnH2QiMS5JazkWi", // admin123
        avatar: null,
        role: "ADMIN",
        status: "ACTIVE",
      },
      {
        name: "User 1",
        phone: "085715519931",
        email: "user1.vascom@gmail.com",
        password: "$2a$10$2mtiMYTnx04DtRwEsq9BnuotBOAIWhSNy1ZxtSLnH2QiMS5JazkWi", // admin123
        avatar: null,
        role: "USER",
        status: "ACTIVE",
      },
      {
        name: "User 2",
        phone: "085715519932",
        email: "user2.vascom@gmail.com",
        password: "$2a$10$2mtiMYTnx04DtRwEsq9BnuotBOAIWhSNy1ZxtSLnH2QiMS5JazkWi", // admin123
        avatar: null,
        role: "USER",
        status: "ACTIVE",
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */

    await queryInterface.bulkDelete("users", null);
  },
};

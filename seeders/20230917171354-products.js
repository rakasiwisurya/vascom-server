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

    await queryInterface.bulkInsert("products", [
      {
        title: "Parfum 1",
        price: 100000,
        photo: "1692592420624-image17.png",
        status: "ACTIVE",
      },
      {
        title: "Parfum 2",
        price: 120000,
        photo: "1692592420624-image17.png",
        status: "ACTIVE",
      },
      {
        title: "Parfum 3",
        price: 130000,
        photo: "1692592420624-image17.png",
        status: "ACTIVE",
      },
      {
        title: "Parfum 4",
        price: 140000,
        photo: "1692592420624-image17.png",
        status: "ACTIVE",
      },
      {
        title: "Parfum 5",
        price: 150000,
        photo: "1692592420624-image17.png",
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

    await queryInterface.bulkDelete("products", null);
  },
};

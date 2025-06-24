'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('service_schedules', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      org_id: {
        type: Sequelize.STRING,
        allowNull: false
      },
      service_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      start_time: {
        type: Sequelize.STRING,
        allowNull: false
      },
      end_time: {
        type: Sequelize.STRING,
        allowNull: false
      },
      weekday: {
        type: Sequelize.STRING,
        allowNull: false
      },
      interval: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Ajouter les index pour optimiser les performances
    await queryInterface.addIndex('service_schedules', ['org_id']);
    await queryInterface.addIndex('service_schedules', ['service_id']);
    await queryInterface.addIndex('service_schedules', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('service_schedules');
  }
};

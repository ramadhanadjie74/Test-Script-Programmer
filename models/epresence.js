'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class EPresence extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
		}
	};
	EPresence.init({
		id_user: DataTypes.INTEGER,
		type: DataTypes.STRING,
		is_approve: DataTypes.BOOLEAN,
		waktu: DataTypes.DATE
	}, {
		sequelize,
		modelName: 'EPresence',
	});
	// EPresence.sync({force: true, alter: true});
	EPresence.sync();
	return EPresence;
};

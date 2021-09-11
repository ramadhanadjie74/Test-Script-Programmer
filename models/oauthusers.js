'use strict';
const bcrypt = require('bcryptjs');
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class OAuthUsers extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			OAuthUsers.hasOne(models.OAuthTokens, {
				foreignKey: 'userId',
				as: 'token',
			});
		}
	};
	OAuthUsers.init({
		nama: { type: DataTypes.STRING, allowNull: false },
		email: { type: DataTypes.STRING, allowNull: false, unique: true },
		npp: { type: DataTypes.INTEGER, allowNull: false, unique: true },
		npp_supervisor: DataTypes.INTEGER,
		password: { type: DataTypes.STRING, allowNull: false}
	}, {
		sequelize,
		modelName: 'OAuthUsers',
	});
	OAuthUsers.beforeSave((user) => {
		if (user.changed('password')) {
			user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10), null);
		}
	});
	// OAuthUsers.sync({force: true, alter: true});
	OAuthUsers.sync();
	return OAuthUsers;
};

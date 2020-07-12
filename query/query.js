const getSelectedPhoneQuery =`
    WITH yourid AS(
      SELECT id FROM users
      WHERE nickname = $1
    )
    SELECT temp.phone_name, temp.phone_brand,(
      SELECT img 
      FROM phone, temp_user_bid AS temp
      WHERE phone.phone_name = temp.phone_name
    )
    FROM temp_user_bid AS temp, yourid
    WHERE temp.user_id = yourid.id
`;
const getPhonesFromDBQuery =`
    SELECT phone_name, phone_brand, img
    FROM phone 
    WHERE ishot = TRUE
    ORDER BY id DESC
    LIMIT 6
`;
const getColorQuery =`
    WITH phone AS(
      SELECT id FROM phone
      WHERE phone_name = $1
    )
    SELECT clr.color, clr.color_code FROM phone_color clr, phone
    WHERE phone.id = clr.phone_id
`;
const getVolumeQuery =`
    WITH phone AS(
      SELECT id FROM phone
      WHERE phone_name = $1
    )
    SELECT vol.phone_volume FROM phone_volume AS vol, phone
    WHERE phone.id = vol.phone_id
`;
var getPhonesByBrandQuery =`
    SELECT phone_name, phone_brand, img
    FROM phone 
    WHERE phone_brand = $1
`;
module.exports = {
    getSelectedPhoneQuery: getSelectedPhoneQuery,
    getPhonesFromDBQuery: getPhonesFromDBQuery,
    getColorQuery: getColorQuery,
    getVolumeQuery: getVolumeQuery,
    getPhonesByBrandQuery: getPhonesByBrandQuery,
};
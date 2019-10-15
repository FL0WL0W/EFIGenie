// #include "TransmissionControlServices/ShiftService/ShiftService_Solenoid.h"

// namespace TransmissionControlServices
// {
// 	ShiftService_Solenoid::ShiftService_Solenoid(
// 		ShiftService_SolenoidConfig *config,
// 		IBooleanOutputService **solenoidOutputServices)
// 	{
// 		_config = config;
// 		_solenoidOutputServices = solenoidOutputServices;
// 	}

// 	void ShiftService_Solenoid::SetGear(unsigned char gear)
// 	{
// 		if(gear == 0 || gear > _config->Gears)
// 		{
// 			//invalid gear
// 			return;
// 		}

// 		unsigned int solenoidGearPosition = _config->SolenoidGearPositions[gear - 1];

// 		for (unsigned char i = 0; i < _config->Solenoids; i++)
// 		{
// 			_solenoidOutputServices[i]->OutputWrite(solenoidGearPosition & (1 << i));
// 		}
// 	}
// 	unsigned char ShiftService_Solenoid::GetNumberOfGears() 
// 	{
// 		return _config->Gears;
// 	}
// }
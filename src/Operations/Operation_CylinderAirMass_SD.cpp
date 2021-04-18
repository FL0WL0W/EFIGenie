#include "Operations/Operation_CylinderAirMass_SD.h"
#include "Config.h"

#ifdef OPERATION_CYLINDERAIRMASS_SD
namespace OperationArchitecture
{
	Operation_CylinderAirMass_SD::Operation_CylinderAirMass_SD(const float cylinderVolume)
	{		
		_cylinderVolume = cylinderVolume;
	}
	
	float Operation_CylinderAirMass_SD::Execute(float cylinderAirTemperature, float manifoldAbsolutePresssure, float volumetricEfficieny)
	{				
		float cylinderVolume = _cylinderVolume * 1000 * volumetricEfficieny; //ml
		
		float airDensity = (manifoldAbsolutePresssure * 101.325f) / (287 /*GasConstant*/ * (cylinderAirTemperature + 273.15f)); // kg/m^3

		return cylinderVolume * airDensity;
	}
	
	IOperationBase *Operation_CylinderAirMass_SD::Create(const void *config, unsigned int &sizeOut)
	{
		return new Operation_CylinderAirMass_SD(Config::CastAndOffset<float>(config, sizeOut));
	}
}
#endif
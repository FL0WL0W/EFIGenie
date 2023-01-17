#include "Operations/Operation.h"

#ifndef OPERATION_CYLINDERAIRMASS_SD_H
#define OPERATION_CYLINDERAIRMASS_SD_H
namespace EFIGenie
{	
	class Operation_CylinderAirMass_SD : public OperationArchitecture::Operation<float, float, float, float>
	{
	protected:
		float _cylinderVolume;
	public:
		Operation_CylinderAirMass_SD(const float cylinderVolume);

		float Execute(float cylinderAirTemperature, float manifoldAbsolutePressure, float VolumetricEfficiency) override;
		
		static OperationArchitecture::AbstractOperation *Create(const void *config, size_t &sizeOut);
	};
}
#endif
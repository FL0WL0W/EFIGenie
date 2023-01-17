#include "Operations/Operation_InjectorDeadTime.h"
#include "Config.h"

using namespace OperationArchitecture;

#ifdef OPERATION_INJECTORDEADTIME_H
namespace EFIGenie
{
	Operation_InjectorDeadTime::Operation_InjectorDeadTime(const float minInjectorFuelMass) : _minInjectorFuelMass(minInjectorFuelMass) { }
	
	float Operation_InjectorDeadTime::Execute(uint8_t squirtsPerCycle, float fuelMass, float injectorFlowRate, float injectorDeadTime)
	{
		float injectorFuelMass = fuelMass / squirtsPerCycle;

		if(injectorFuelMass < _minInjectorFuelMass)
			injectorFuelMass = _minInjectorFuelMass;
		
		return injectorFuelMass / injectorFlowRate + injectorDeadTime;
	}
	
	AbstractOperation *Operation_InjectorDeadTime::Create(const void *config, size_t &sizeOut)
	{
		return new Operation_InjectorDeadTime(Config::CastAndOffset<float>(config, sizeOut));
	}
}
#endif
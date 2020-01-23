#include "Operations/Operation_DigitalPinWrite.h"

#ifdef OPERATION_DIGITALPINWRITE_H
namespace Operations
{
	Operation_DigitalPinWrite::Operation_DigitalPinWrite(HardwareAbstraction::IDigitalService *digitalService, const uint16_t pin, const bool normalOn, const bool highZ)
	{
		_digitalService = digitalService;
		_pin = pin;
		_normalOn = normalOn;
		_highZ = highZ;

		if (_highZ && _normalOn)
		{
			_digitalService->InitPin(_pin, In);
		}
		else
		{
			_digitalService->InitPin(_pin, Out);

			_digitalService->WritePin(_pin, _normalOn);
		}
	}

	void Operation_DigitalPinWrite::Execute(ScalarVariable xIn)
	{
		if(xIn.Type != BOOLEAN)
			return;
		bool x = xIn.To<bool>();

		if(x) 
		{
			if (_highZ && !_normalOn)
			{
				_digitalService->InitPin(_pin, In);
			}
			else
			{
				if (_highZ)
				{
					_digitalService->InitPin(_pin, Out);
				}
				
				_digitalService->WritePin(_pin, !_normalOn);
			}
		}
		else 
		{
			if (_highZ && _normalOn)
			{
				_digitalService->InitPin(_pin, In);
			}
			else
			{
				if (_highZ)
				{
					_digitalService->InitPin(_pin, Out);
				}
				
				_digitalService->WritePin(_pin, _normalOn);
			}
		}
	}

	IOperationBase *Operation_DigitalPinWrite::Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
		const uint16_t pin = IService::CastAndOffset<uint16_t>(config, sizeOut);
		const bool normalOn = IService::CastAndOffset<bool>(config, sizeOut);
		const bool highZ = IService::CastAndOffset<bool>(config, sizeOut);
		return new Operation_DigitalPinWrite(serviceLocator->LocateAndCast<HardwareAbstraction::IDigitalService>(DIGITAL_SERVICE_ID), pin, normalOn, highZ);
	}

	IOPERATION_REGISTERFACTORY_CPP(Operation_DigitalPinWrite, 10)
}
#endif
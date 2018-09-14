#include "IOServices/BooleanOutputService/BooleanOutputService.h"

#ifdef BOOLEANOUTPUTSERVICE_H
namespace IOServices
{
	BooleanOutputService::BooleanOutputService(const HardwareAbstractionCollection *hardwareAbstractionCollection, const BooleanOutputServiceConfig *config)
	{
		_hardwareAbstractionCollection = hardwareAbstractionCollection;
		_config = config;		

		if (_config->HighZ && _config->NormalOn)
		{
			_hardwareAbstractionCollection->DigitalService->InitPin(_config->Pin, In);
		}
		else
		{
			_hardwareAbstractionCollection->DigitalService->InitPin(_config->Pin, Out);

			_hardwareAbstractionCollection->DigitalService->WritePin(_config->Pin, _config->NormalOn);
		}
	}
	
	void BooleanOutputService::OutputSet()
	{
		if (_config->HighZ && !_config->NormalOn)
		{
			_hardwareAbstractionCollection->DigitalService->InitPin(_config->Pin, In);
		}
		else
		{
			if (_config->HighZ)
			{
				_hardwareAbstractionCollection->DigitalService->InitPin(_config->Pin, Out);
			}
			
			_hardwareAbstractionCollection->DigitalService->WritePin(_config->Pin, !_config->NormalOn);
		}
	}
	
	void BooleanOutputService::OutputReset()
	{
		if (_config->HighZ && _config->NormalOn)
		{
			_hardwareAbstractionCollection->DigitalService->InitPin(_config->Pin, In);
		}
		else
		{
			if (_config->HighZ)
			{
				_hardwareAbstractionCollection->DigitalService->InitPin(_config->Pin, Out);
			}
			
			_hardwareAbstractionCollection->DigitalService->WritePin(_config->Pin, _config->NormalOn);
		}
	}
		
	void BooleanOutputService::OutputWrite(bool val)
	{
		if (val)
			OutputSet();
		else
			OutputReset();
	}
}
#endif
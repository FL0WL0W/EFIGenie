#include "Operations/Operation_EngineScheduleIgnitionArray.h"
#include "Config.h"
using namespace EmbeddedIOServices;

#ifdef OPERATION_ENGINESCHEDULEIGNITIONARRAY_H
namespace OperationArchitecture
{
	Operation_EngineScheduleIgnitionArray::Operation_EngineScheduleIgnitionArray(ITimerService *timerService, uint8_t length, const float *tdc, IOperation<void, bool> **ignitionOutputOperation)
	{
        _length = length;
        _array = reinterpret_cast<Operation_EngineScheduleIgnition **>(malloc(sizeof(Operation_EngineScheduleIgnition *) * _length));

        for(uint8_t i = 0; i < _length; i++)
        {
            _array[i] = new Operation_EngineScheduleIgnition(timerService, tdc[i], ignitionOutputOperation[i]);
        }

        _ret.Initialize(_length);
	}

	EngineScheduleIgnitionArray Operation_EngineScheduleIgnitionArray::Execute(EnginePosition enginePosition, float ignitionDwell, float ignitionAdvance)
	{
        for(uint8_t i = 0; i < _length; i++)
        {
            std::tuple<uint32_t, uint32_t> ex = _array[i]->Execute(enginePosition, ignitionDwell, ignitionAdvance);
            _ret.DwellTick[i] = std::get<0>(ex);
            _ret.IgnitionTick[i] = std::get<1>(ex);
        }

        return _ret;
	}

	static IOperationBase *Create(const EmbeddedIOServiceCollection *embeddedIOServiceCollection, const void *config, unsigned int &sizeOut)
	{
		const uint8_t length = Config::CastAndOffset<uint8_t>(config, sizeOut);
		const float *tdc = reinterpret_cast<const float *>(config);
        Config::OffsetConfig(config, sizeOut, sizeof(float) * length);
        IOperation<void, bool> **ignitionOutputOperation = reinterpret_cast<IOperation<void, bool> **>(malloc(sizeof(IOperation<void, bool> *) * length));
        for(uint8_t i = 0; i < length; i++)
        {
		    unsigned int size = 0;
            ignitionOutputOperation[i] = 0;//static_cast<IOperation<void, bool> *>(IOperationBase::Create(serviceLocator, config, size));
		    Config::OffsetConfig(config, sizeOut, size);
        }

		return new Operation_EngineScheduleIgnitionArray(embeddedIOServiceCollection->TimerService, length, tdc, ignitionOutputOperation);
	}
}
#endif
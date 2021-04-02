#include "Operations/Operation_EngineScheduleIgnitionArray.h"
#include "Config.h"
using namespace EmbeddedIOServices;

#ifdef OPERATION_ENGINESCHEDULEIGNITIONARRAY_H
namespace OperationArchitecture
{
	Operation_EngineScheduleIgnitionArray::Operation_EngineScheduleIgnitionArray(ITimerService *timerService, Operation_EnginePositionPrediction *predictor, uint8_t length, const float *tdc, ICallBack **dwellCallBacks, ICallBack **igniteCallBacks)
	{
        _length = length;
        _array = new Operation_EngineScheduleIgnition *[_length];

        for(uint8_t i = 0; i < _length; i++)
        {
            _array[i] = new Operation_EngineScheduleIgnition(timerService, predictor, tdc[i], dwellCallBacks[i], igniteCallBacks[i]);
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

	IOperationBase *Operation_EngineScheduleIgnitionArray::Create(const EmbeddedIOServiceCollection *embeddedIOServiceCollection, const void *config, unsigned int &sizeOut)
	{
		Config::OffsetConfig(config, sizeOut, sizeof(uint32_t)); //skip over FactoryID
		const uint8_t length = Config::CastAndOffset<uint8_t>(config, sizeOut);
		const float *tdc = reinterpret_cast<const float *>(config);
        Config::OffsetConfig(config, sizeOut, sizeof(float) * length);
        ICallBack **dwellCallBacks = new ICallBack*[length];
        ICallBack **igniteCallBacks = new ICallBack*[length];
        for(uint8_t i = 0; i < length; i++)
        {
		    const uint32_t dwellOperationId = Config::CastAndOffset<uint32_t>(config, sizeOut);
		    const uint32_t igniteOperationId = Config::CastAndOffset<uint32_t>(config, sizeOut);
            // dwellCallBacks[i] = new CallBack<IOperationBase>(, &IOperationBase::Execute);
            // igniteCallBacks[i] = new CallBack<IOperationBase>(, &IOperationBase::Execute);
        }

		return new Operation_EngineScheduleIgnitionArray(embeddedIOServiceCollection->TimerService, new Operation_EnginePositionPrediction(embeddedIOServiceCollection->TimerService), length, tdc, dwellCallBacks, igniteCallBacks);
	}
}
#endif
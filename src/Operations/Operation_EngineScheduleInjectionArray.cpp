#include "Operations/Operation_EngineScheduleInjectionArray.h"
#include "Config.h"
using namespace EmbeddedIOServices;

#ifdef OPERATION_ENGINESCHEDULEINJECTTIONARRAY_H
namespace OperationArchitecture
{
	Operation_EngineScheduleInjectionArray::Operation_EngineScheduleInjectionArray(EmbeddedIOServices::ITimerService *timerService, Operation_EnginePositionPrediction *predictor, uint8_t length, const float* tdc, ICallBack **openCallBacks, ICallBack **closeCallBacks)
	{
        _length = length;
        _array = new Operation_EngineScheduleInjection *[_length];

        for(uint8_t i = 0; i < _length; i++)
        {
            _array[i] = new Operation_EngineScheduleInjection(timerService, predictor, tdc[i], openCallBacks[i], closeCallBacks[i]);
        }

        _ret.Initialize(_length);
	}

	EngineScheduleInjectionArray Operation_EngineScheduleInjectionArray::Execute(EnginePosition enginePosition, float injectionPulseWidth, float injectionEndPosition)
	{
        for(uint8_t i = 0; i < _length; i++)
        {
            std::tuple<float, float> ex = _array[i]->Execute(enginePosition, injectionPulseWidth, injectionEndPosition);
            _ret.OpenTick[i] = std::get<0>(ex);
            _ret.CloseTick[i] = std::get<1>(ex);
        }

        return _ret;
	}

	IOperationBase *Operation_EngineScheduleInjectionArray::Create(const EmbeddedIOServiceCollection *embeddedIOServiceCollection, const void *config, unsigned int &sizeOut)
	{
		Config::OffsetConfig(config, sizeOut, sizeof(uint32_t)); //skip over FactoryID
		const uint8_t length = Config::CastAndOffset<uint8_t>(config, sizeOut);
		const float *tdc = reinterpret_cast<const float *>(config);
        Config::OffsetConfig(config, sizeOut, sizeof(float) * length);
        ICallBack **openCallBacks = new ICallBack*[length];
        ICallBack **closeCallBacks = new ICallBack*[length];
        for(uint8_t i = 0; i < length; i++)
        {
            const uint32_t openOperationId = Config::CastAndOffset<uint32_t>(config, sizeOut);
            const uint32_t closeOperationId = Config::CastAndOffset<uint32_t>(config, sizeOut);
            // openCallBacks[i] = new CallBack<IOperationBase>(, &IOperationBase::Execute);
            // closeCallBacks[i] = new CallBack<IOperationBase>(, &IOperationBase::Execute);
        }

		return new Operation_EngineScheduleInjectionArray(embeddedIOServiceCollection->TimerService, new Operation_EnginePositionPrediction(embeddedIOServiceCollection->TimerService), length, tdc, openCallBacks, closeCallBacks);
	}
}
#endif
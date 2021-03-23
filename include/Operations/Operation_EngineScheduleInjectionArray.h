#include "Operations/IOperation.h"
#include "Operations/Operation_EngineScheduleInjection.h"

#ifndef OPERATION_ENGINESCHEDULEINJECTTIONARRAY_H
#define OPERATION_ENGINESCHEDULEINJECTTIONARRAY_H
namespace OperationArchitecture
{
	struct EngineScheduleInjectionArray
	{
		public:
		void Initialize(uint8_t length)
		{
			Length = length;
			OpenTick = reinterpret_cast<uint32_t*>(malloc(sizeof(uint32_t) * Length));
			CloseTick = reinterpret_cast<uint32_t*>(malloc(sizeof(uint32_t) * Length));
		}

		uint8_t Length;
		uint32_t* OpenTick;
		uint32_t* CloseTick;
	};

	class Operation_EngineScheduleInjectionArray : public IOperation<EngineScheduleInjectionArray, EnginePosition, float, float>
	{
	protected:
		uint8_t _length;
		Operation_EngineScheduleInjection **_array;
		EngineScheduleInjectionArray _ret;
	public:		
        Operation_EngineScheduleInjectionArray(EmbeddedIOServices::ITimerService *timerService, Operation_EnginePositionPrediction *predictor, uint8_t length, const float* tdc, EmbeddedIOServices::ICallBack **openCallBacks, EmbeddedIOServices::ICallBack **closeCallBacks);

		EngineScheduleInjectionArray Execute(EnginePosition enginePosition, float injectionPulseWidth, float injectionEndPosition) override;

		static IOperationBase *Create(const EmbeddedIOServices::EmbeddedIOServiceCollection *embeddedIOServiceCollection, const void *config, unsigned int &sizeOut);
	};
}
#endif
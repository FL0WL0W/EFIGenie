#include "Operations/IOperation.h"
#include "Operations/Operation_EnginePositionPrediction.h"
#include <tuple>

#ifndef OPERATION_ENGINESCHEDULEINJECTION_H
#define OPERATION_ENGINESCHEDULEINJECTION_H
namespace OperationArchitecture
{
	class Operation_EngineScheduleInjection : public IOperation<std::tuple<float, float>, EnginePosition, float, float>
	{
	protected:
		EmbeddedIOServices::ITimerService *_timerService;
		float _tdc;
		Operation_EnginePositionPrediction *_predictor;
		IOperation<void, bool> *_injectionOutputOperation;
		EmbeddedIOServices::Task *_openTask;
		EmbeddedIOServices::Task *_closeTask;
		uint32_t _lastOpenedAtTick = 0;
		bool _open = false;
	public:		
        Operation_EngineScheduleInjection(EmbeddedIOServices::ITimerService *timerService, float tdc, IOperation<void, bool> *injectionOutputOperation);

		std::tuple<float, float> Execute(EnginePosition enginePosition, float injectionPulseWidth, float injectionEndPosition) override;
		void Open();
		void Close();

		static IOperationBase *Create(const EmbeddedIOServices::EmbeddedIOServiceCollection *embeddedIOServiceCollection, const void *config, unsigned int &sizeOut);
	};
}
#endif
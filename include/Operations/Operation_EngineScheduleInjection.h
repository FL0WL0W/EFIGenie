#include "Operations/IOperation.h"
#include "Operations/Operation_EnginePositionPrediction.h"
#include "Operations/OperationPackager.h"
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
		std::function<void()> _openCallBack;
		std::function<void()> _closeCallBack;
		EmbeddedIOServices::Task *_openTask;
		EmbeddedIOServices::Task *_closeTask;
		uint32_t _lastOpenedAtTick = 0;
		bool _open = false;
	public:		
        Operation_EngineScheduleInjection(EmbeddedIOServices::ITimerService *timerService, Operation_EnginePositionPrediction *predictor, float tdc, std::function<void()> openCallBack, std::function<void()> closeCallBack);

		std::tuple<float, float> Execute(EnginePosition enginePosition, float injectionPulseWidth, float injectionEndPosition) override;
		void Open();
		void Close();

		static IOperationBase *Create(const void *config, size_t &sizeOut, const EmbeddedIOServices::EmbeddedIOServiceCollection *embeddedIOServiceCollection, OperationPackager *packager);
	};
}
#endif
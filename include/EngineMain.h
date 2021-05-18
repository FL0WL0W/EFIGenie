#include "EmbeddedIOServiceCollection.h"
#include "Operations/OperationPackager.h"

#ifndef ENGINEMAIN_H
#define ENGINEMAIN_H
namespace Engine
{
	class EngineMain
	{
		protected:
		OperationArchitecture::IOperationBase *_inputsExecute;
		OperationArchitecture::IOperationBase *_preSyncExecute;
		OperationArchitecture::IOperationBase *_syncCondition;
		OperationArchitecture::IOperationBase *_mainLoopExecute;

		public:
		OperationArchitecture::SystemBus *SystemBus;
		EngineMain(const void *config, size_t &sizeOut, const EmbeddedIOServices::EmbeddedIOServiceCollection *embeddedIOServiceCollection);

		void Setup();
		void Loop();
	};
}
#endif
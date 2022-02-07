#include "EmbeddedIOServiceCollection.h"
#include "Operations/OperationPackager.h"

#ifndef ENGINEMAIN_H
#define ENGINEMAIN_H
namespace EFIGenie
{
	class EFIGenieMain
	{
		protected:
		OperationArchitecture::IOperationBase *_inputsExecute;
		OperationArchitecture::IOperationBase *_preSyncExecute;
		OperationArchitecture::IOperationBase *_syncCondition;
		OperationArchitecture::IOperationBase *_mainLoopExecute;
		bool _syncedOnce = false;

		public:
		OperationArchitecture::SystemBus *SystemBus;
		EFIGenieMain(const void *config, size_t &sizeOut, const EmbeddedIOOperations::EmbeddedIOServiceCollection *embeddedIOServiceCollection);

		void Setup();
		void Loop();
	};
}
#endif
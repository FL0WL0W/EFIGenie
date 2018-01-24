namespace EngineManagement
{	
	class IInjectorService
	{
	public:
		virtual void InjectorOpen() = 0;
		virtual void InjectorClose() = 0;
	};
}